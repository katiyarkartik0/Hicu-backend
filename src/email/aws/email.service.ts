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

  createEmailBody({ html, text }: { html?: string; text?: string }) {
    if (!html && !text) {
      throw new Error('Either html or text must be provided');
    }
    const body: any = {};
    if (html || !text) {
      body.Html = {
        Data: html,
        Charset: 'UTF-8',
      };
    }
    if (text || !html) {
      body.Text = {
        Data: text,
        Charset: 'UTF-8',
      };
    }
    return body;
  }

  createEmailParams({
    ToAddresses,
    CcAddresses,
    BccAddresses,
    inviterEmail,
    subject,
    body,
  }: {
    ToAddresses: Array<string>;
    CcAddresses?: Array<string>;
    BccAddresses?: Array<string>;
    inviterEmail: string;
    subject: string;
    body: object;
  }) {
    return {
      Source: inviterEmail,
      Destination: { ToAddresses, CcAddresses, BccAddresses },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: body,
      },
    };
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
    const body = this.createEmailBody({ html, text });

    const params = this.createEmailParams({
      ToAddresses,
      CcAddresses,
      BccAddresses,
      inviterEmail,
      subject,
      body,
    });

    try {
      const command = new SendEmailCommand(params);
      const result = await this.sesClient.send(command);
      this.logger.log(`Invite email sent: ${result.MessageId}`);
    } catch (error) {
      this.logger.error('Failed to send invite email', error);
      throw error;
    }
  }
}
