import { Module } from '@nestjs/common';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';
import { S3Service } from './s3.service';
import { PdfService } from './pdf.service';

@Module({
  controllers: [CertificatesController],
  providers: [CertificatesService, S3Service, PdfService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
