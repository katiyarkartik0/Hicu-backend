import { Injectable, Logger } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private sesClient: SESClient;

  constructor() {
    this.sesClient = new SESClient({
      region: 'us-east-1', // or your SES region
      credentials: {
        accessKeyId: process.env.AWS_SES_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SES_SECRET_KEY!,
      },
    });
  }

  async sendInviteEmail({
    ToAddresses,
    CcAddresses,
    BccAddresses,
    inviterEmail,
    subject = 'You’ve been invited!',
    html,
    text,
  }: {
    ToAddresses: Array<string>;
    CcAddresses?: Array<string>;
    BccAddresses?: Array<string>;
    inviterEmail: string;
    scope: string[];
    subject?: string;
    html?: string;
    text?: string;
  }) {
    
  }
}
