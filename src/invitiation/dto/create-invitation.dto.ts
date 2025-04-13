import { IsEmail, IsArray, ArrayNotEmpty, IsOptional } from 'class-validator';

export class CreateInvitationDto {
  @IsEmail()
  recipientEmail: string;

  @IsEmail()
  @IsOptional()
  senderEmail: string;

  @IsArray()
  @ArrayNotEmpty()
  scopes: string[]; // Example: ["admin@example.com:INSTAGRAM:MARKETER:COMMENT_AUTOREPLY"]
}
