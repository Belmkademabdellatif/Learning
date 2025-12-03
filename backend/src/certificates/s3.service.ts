import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service {
  private s3: AWS.S3;
  private bucketName: string;

  constructor(private config: ConfigService) {
    this.s3 = new AWS.S3({
      endpoint: config.get('S3_ENDPOINT'),
      accessKeyId: config.get('S3_ACCESS_KEY'),
      secretAccessKey: config.get('S3_SECRET_KEY'),
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });

    this.bucketName = config.get('S3_BUCKET_NAME') || 'codelearn-certificates';
    this.ensureBucket();
  }

  private async ensureBucket() {
    try {
      await this.s3.headBucket({ Bucket: this.bucketName }).promise();
    } catch (error) {
      if (error.code === 'NotFound') {
        await this.s3.createBucket({ Bucket: this.bucketName }).promise();
        console.log(`✅ Created S3 bucket: ${this.bucketName}`);
      }
    }
  }

  async upload(key: string, buffer: Buffer, contentType: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'private',
    };

    await this.s3.upload(params).promise();

    return `s3://${this.bucketName}/${key}`;
  }

  async getSignedUrl(s3Url: string, expiresIn: number = 3600): Promise<string> {
    const key = s3Url.replace(`s3://${this.bucketName}/`, '');

    return this.s3.getSignedUrlPromise('getObject', {
      Bucket: this.bucketName,
      Key: key,
      Expires: expiresIn,
    });
  }

  async delete(s3Url: string): Promise<void> {
    const key = s3Url.replace(`s3://${this.bucketName}/`, '');

    await this.s3
      .deleteObject({
        Bucket: this.bucketName,
        Key: key,
      })
      .promise();
  }
}
