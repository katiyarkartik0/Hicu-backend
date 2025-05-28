import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';

  constructor(private readonly configService: ConfigService) {}

  encrypt(text: string): string {
    const secretKey = this.configService.getOrThrow<string>('ENCRYPTION_SECRET_KEY');

    const iv = crypto.randomBytes(16); // generate new IV for each encryption
    const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(secretKey), iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  decrypt(encryptedText: string): string {
    const secretKey = this.configService.getOrThrow<string>('ENCRYPTION_SECRET_KEY');
    const [ivHex, encryptedHex] = encryptedText.split(':');
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(secretKey),
      Buffer.from(ivHex, 'hex'),
    );
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString();
  }
}
