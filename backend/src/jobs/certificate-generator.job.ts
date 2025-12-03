import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import { CertificatesService } from '../certificates/certificates.service';
import { CertificateStatus } from '@prisma/client';

@Injectable()
export class CertificateGeneratorJob {
  private readonly logger = new Logger(CertificateGeneratorJob.name);

  constructor(
    private prisma: PrismaService,
    private certificatesService: CertificatesService,
  ) {}

  // Run daily at 23:59
  @Cron('59 23 * * *')
  async generateDailyCertificates() {
    this.logger.log('Starting daily certificate generation...');

    try {
      // Find enrollments completed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const completedToday = await this.prisma.enrollment.findMany({
        where: {
          completedAt: {
            gte: today,
          },
        },
        include: {
          certificates: true,
        },
      });

      this.logger.log(`Found ${completedToday.length} completions today`);

      let generated = 0;
      let failed = 0;

      for (const enrollment of completedToday) {
        // Check if certificate already exists
        const hasCertificate = enrollment.certificates.some(
          (cert) => cert.status === CertificateStatus.GENERATED,
        );

        if (hasCertificate) {
          continue;
        }

        try {
          await this.certificatesService.generateCertificate(
            enrollment.userId,
            enrollment.trackId,
          );
          generated++;
          this.logger.log(
            `Generated certificate for user ${enrollment.userId}, track ${enrollment.trackId}`,
          );
        } catch (error) {
          failed++;
          this.logger.error(
            `Failed to generate certificate for user ${enrollment.userId}: ${error.message}`,
          );
        }
      }

      this.logger.log(
        `Certificate generation complete. Generated: ${generated}, Failed: ${failed}`,
      );
    } catch (error) {
      this.logger.error('Error in certificate generation job:', error);
    }
  }

  // Retry failed certificates every 6 hours
  @Cron(CronExpression.EVERY_6_HOURS)
  async retryFailedCertificates() {
    this.logger.log('Retrying failed certificates...');

    try {
      const failed = await this.prisma.certificate.findMany({
        where: {
          status: CertificateStatus.FAILED,
        },
        include: {
          user: true,
          track: true,
        },
        take: 10, // Limit to 10 retries per run
      });

      for (const cert of failed) {
        try {
          await this.certificatesService.generateCertificate(cert.userId, cert.trackId);
          this.logger.log(`Retry successful for certificate ${cert.id}`);
        } catch (error) {
          this.logger.error(`Retry failed for certificate ${cert.id}: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error('Error in retry job:', error);
    }
  }
}
