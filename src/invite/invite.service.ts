import { Injectable, UseGuards } from '@nestjs/common';
import { CreateInviteDto } from './dto/create-invite.dto';
import { UpdateInviteDto } from './dto/update-invite.dto';
import { AuthService } from 'src/auth/auth.service';
import { AccountMemberService } from 'src/account-member/account-member.service';
import { EmailService } from 'src/email/nodemailer/email.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Injectable()
export class InviteService {
  constructor(
    private readonly authService: AuthService,
    private readonly accountMemberService: AccountMemberService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {}

  private generateTemporaryCredentialsHTML(temporaryCredentials: { email: string; password: string }) {
    return `
      <html>
        <body>
          <h2>Welcome to Our Platform!</h2>
          <p>We are excited to have you on board. Below are your temporary credentials:</p>
          <table style="border: 1px solid #ddd; border-collapse: collapse; width: 100%;">
            <tr>
              <th style="padding: 8px; text-align: left; background-color: #f4f4f4;">Email</th>
              <td style="padding: 8px;">${temporaryCredentials.email}</td>
            </tr>
            <tr>
              <th style="padding: 8px; text-align: left; background-color: #f4f4f4;">Temporary Password</th>
              <td style="padding: 8px;">${temporaryCredentials.password}</td>
            </tr>
          </table>
          <p>Please log in using these credentials and change your password as soon as possible for security reasons.</p>
          <p>If you have any questions, feel free to contact us.</p>
          <p>Best regards,<br>Your Company Team</p>
        </body>
      </html>
    `;
  }

  async create({
    inviteeEmail,
    inviterEmail,
    accountId,
    scope,
  }: CreateInviteDto) {
    const temporaryPassword = this.generateTemporaryPassword();
    const temporaryCredentials = {
      email:inviteeEmail,
      password: temporaryPassword,
    };
    const {
      user: { id: memberId },
    } = await this.authService.signup(temporaryCredentials);

    const { id: accountMemberId } = await this.accountMemberService.create({
      memberId,
      accountId,
      scope,
    });

    this.emailService.sendInviteEmail({
      ToAddresses: [inviteeEmail],
      inviterEmail,
      html:this.generateTemporaryCredentialsHTML(temporaryCredentials)
    });
    return {
      accessToken: await this.jwtService.signAsync({
        credentials: temporaryCredentials,
        accountMemberId,
      }),
    };
  }

  findAll() {
    return `This action returns all invite`;
  }

  findOne(id: number) {
    return `This action returns a #${id} invite`;
  }

  update(id: number, updateInviteDto: UpdateInviteDto) {
    return `This action updates a #${id} invite`;
  }

  remove(id: number) {
    return `This action removes a #${id} invite`;
  }

  generateTemporaryPassword(): string {
    return crypto.randomBytes(6).toString('base64').slice(0, 10);
  }
}
