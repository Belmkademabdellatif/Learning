import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { PdfService } from './pdf.service';
import { S3Service } from './s3.service';
import { CertificateStatus } from '@prisma/client';
import { nanoid } from 'nanoid';

@Injectable()
export class CertificatesService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private s3Service: S3Service,
  ) {}

  async generateCertificate(userId: string, trackId: string) {
    // Check if track is completed
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_trackId: { userId, trackId },
      },
      include: {
        user: true,
        track: true,
      },
    });

    if (!enrollment) {
      throw new BadRequestException('You are not enrolled in this track');
    }

    if (!enrollment.completedAt) {
      throw new BadRequestException('Track has not been completed yet');
    }

    // Generate verification code
    const verificationCode = nanoid(16).toUpperCase();

    // Use upsert to avoid race condition between concurrent requests
    let certificate = await this.prisma.certificate.upsert({
      where: {
        userId_trackId: { userId, trackId },
      },
      update: {},
      create: {
        userId,
        trackId,
        verificationCode,
        status: CertificateStatus.PENDING,
      },
    });

    if (certificate.status === CertificateStatus.GENERATED) {
      return certificate;
    }

    try {
      // Generate PDF
      const pdfBuffer = await this.pdfService.generateCertificatePdf({
        userName: `${enrollment.user.firstName} ${enrollment.user.lastName}`,
        trackTitle: enrollment.track.title,
        completionDate: enrollment.completedAt,
        verificationCode,
      });

      // Generate QR code and upload
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const qrCodeBuffer = await this.pdfService.generateQRCode(
        `${frontendUrl}/verify/${verificationCode}`,
      );

      const qrCodeUrl = await this.s3Service.upload(
        `qr-codes/${verificationCode}.png`,
        qrCodeBuffer,
        'image/png',
      );

      // Upload PDF
      const pdfUrl = await this.s3Service.upload(
        `certificates/${verificationCode}.pdf`,
        pdfBuffer,
        'application/pdf',
      );

      // Update certificate
      certificate = await this.prisma.certificate.update({
        where: { id: certificate.id },
        data: {
          status: CertificateStatus.GENERATED,
          pdfUrl,
          qrCodeUrl,
          generatedAt: new Date(),
        },
      });

      return certificate;
    } catch (error) {
      // Mark as failed
      await this.prisma.certificate.update({
        where: { id: certificate.id },
        data: { status: CertificateStatus.FAILED },
      });

      throw error;
    }
  }

  async getUserCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: {
        userId,
        status: CertificateStatus.GENERATED,
      },
      include: {
        track: {
          select: {
            title: true,
            difficulty: true,
          },
        },
      },
      orderBy: { generatedAt: 'desc' },
    });
  }

  async getCertificate(id: string, userId: string) {
    const certificate = await this.prisma.certificate.findFirst({
      where: { id, userId },
      include: {
        track: true,
        user: true,
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return certificate;
  }

  async verifyCertificate(verificationCode: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { verificationCode },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        track: {
          select: {
            title: true,
            difficulty: true,
          },
        },
      },
    });

    if (!certificate) {
      return { valid: false };
    }

    return {
      valid: true,
      userName: `${certificate.user.firstName} ${certificate.user.lastName}`,
      trackTitle: certificate.track.title,
      issuedAt: certificate.issuedAt,
    };
  }

  async downloadCertificate(id: string, userId: string) {
    const certificate = await this.getCertificate(id, userId);

    if (!certificate.pdfUrl) {
      throw new BadRequestException('Certificate PDF not available');
    }

    // Generate signed URL
    const signedUrl = await this.s3Service.getSignedUrl(certificate.pdfUrl);

    return { url: signedUrl };
  }
}
