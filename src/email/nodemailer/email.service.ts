import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const { username, password } = this.configService.getOrThrow<{
      username: string;
      password: string;
    }>('ehterealUserCredentials');
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: username,
        pass: password,
      },
    });
  }

  private createEmailBody({ html, text }: { html?: string; text?: string }) {
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

  private createEmailParams({
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
    subject?: string;
    html?: string;
    text?: string;
  }) {
    try {
      const info = await this.transporter.sendMail({
        from: inviterEmail,
        to: ToAddresses.join(', '),
        cc: CcAddresses,
        bcc: BccAddresses,
        subject,
        text,
        html,
      });

      this.logger.log(`Dev email sent: ${info.messageId}`);
      this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (error) {
      this.logger.error('Nodemailer failed to send email', error);
      throw error;
    }
  }
}
