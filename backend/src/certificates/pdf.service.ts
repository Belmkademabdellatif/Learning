import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as QRCode from 'qrcode';

interface CertificateData {
  userName: string;
  trackTitle: string;
  completionDate: Date;
  verificationCode: string;
}

@Injectable()
export class PdfService {
  async generateCertificatePdf(data: CertificateData): Promise<Buffer> {
    const html = this.getCertificateTemplate(data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html);

      const pdf = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  async generateQRCode(text: string): Promise<Buffer> {
    return QRCode.toBuffer(text, {
      width: 200,
      margin: 1,
    });
  }

  private getCertificateTemplate(data: CertificateData): string {
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(data.completionDate);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            width: 297mm;
            height: 210mm;
            font-family: 'Georgia', serif;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .certificate {
            width: 280mm;
            height: 195mm;
            background: white;
            padding: 40px;
            border: 20px solid #f8f9fa;
            box-shadow: 0 0 40px rgba(0,0,0,0.1);
            position: relative;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .logo {
            font-size: 48px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
          }
          .certificate-title {
            font-size: 52px;
            color: #2d3748;
            margin-bottom: 20px;
            letter-spacing: 4px;
            text-transform: uppercase;
          }
          .subtitle {
            font-size: 18px;
            color: #718096;
            font-style: italic;
          }
          .content {
            text-align: center;
            margin: 60px 0;
          }
          .awarded-to {
            font-size: 20px;
            color: #718096;
            margin-bottom: 20px;
          }
          .recipient-name {
            font-size: 56px;
            color: #2d3748;
            margin-bottom: 40px;
            font-weight: bold;
            border-bottom: 3px solid #667eea;
            display: inline-block;
            padding-bottom: 10px;
          }
          .completion-text {
            font-size: 22px;
            color: #4a5568;
            line-height: 1.8;
          }
          .track-title {
            font-size: 32px;
            color: #667eea;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 60px;
          }
          .date {
            font-size: 16px;
            color: #718096;
          }
          .verification {
            text-align: right;
          }
          .verification-code {
            font-size: 14px;
            color: #718096;
            font-family: monospace;
          }
          .seal {
            position: absolute;
            bottom: 40px;
            right: 80px;
            width: 120px;
            height: 120px;
            border: 8px solid #667eea;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
          }
          .seal-text {
            text-align: center;
            font-size: 12px;
            font-weight: bold;
            color: #667eea;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <div class="logo">CodeLearn</div>
            <div class="certificate-title">Certificate of Completion</div>
            <div class="subtitle">This certifies that</div>
          </div>

          <div class="content">
            <div class="awarded-to">This is proudly presented to</div>
            <div class="recipient-name">${data.userName}</div>
            <div class="completion-text">
              For successfully completing the
            </div>
            <div class="track-title">${data.trackTitle}</div>
            <div class="completion-text">
              Demonstrating dedication, skill, and mastery of the course material
            </div>
          </div>

          <div class="footer">
            <div class="date">
              <strong>Date of Completion:</strong><br>
              ${formattedDate}
            </div>
            <div class="verification">
              <strong>Verification Code:</strong><br>
              <span class="verification-code">${data.verificationCode}</span>
            </div>
          </div>

          <div class="seal">
            <div class="seal-text">
              VERIFIED<br>CERTIFICATE
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
