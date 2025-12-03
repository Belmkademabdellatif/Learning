import { Controller, Get, Post, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private certificatesService: CertificatesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user certificates' })
  async getUserCertificates(@Req() req) {
    return this.certificatesService.getUserCertificates(req.user.id);
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate certificate for completed track' })
  async generateCertificate(@Query('trackId') trackId: string, @Req() req) {
    return this.certificatesService.generateCertificate(req.user.id, trackId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get certificate details' })
  async getCertificate(@Param('id') id: string, @Req() req) {
    return this.certificatesService.getCertificate(id, req.user.id);
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download certificate PDF' })
  async downloadCertificate(@Param('id') id: string, @Req() req) {
    return this.certificatesService.downloadCertificate(id, req.user.id);
  }

  @Get('verify/:code')
  @ApiOperation({ summary: 'Verify certificate by code' })
  async verifyCertificate(@Param('code') code: string) {
    return this.certificatesService.verifyCertificate(code);
  }
}
