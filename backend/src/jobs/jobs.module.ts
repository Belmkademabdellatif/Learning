import { Module } from '@nestjs/common';
import { CertificateGeneratorJob } from './certificate-generator.job';
import { CertificatesModule } from '../certificates/certificates.module';

@Module({
  imports: [CertificatesModule],
  providers: [CertificateGeneratorJob],
})
export class JobsModule {}
