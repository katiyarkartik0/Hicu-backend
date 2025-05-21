import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as CompanyEmailValidator from 'company-email-validator';

import { JwtService } from '@nestjs/jwt';
import { MemberService } from 'src/member/member.service';
import { LoginDto, UserDto } from './auth.dto';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private memberService: MemberService,
  ) {}

  async signIn({
    email,
    password: incomingRawPassword,
  }: LoginDto): Promise<any> {
    const user = await this.memberService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password: storedHashedPassword, ...rest } = user;
    const passwordMatch = await bcrypt.compare(
      incomingRawPassword,
      storedHashedPassword,
    );
    if (!passwordMatch) {
      throw new UnauthorizedException('wrong password');
    }
    const { id } = rest;
    const payload = { id };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async signup({
    name,
    email,
    password: incomingRawPassword,
  }: UserDto): Promise<any> {
    const user = await this.memberService.findByEmail(email);
    if (user) {
      throw new UnauthorizedException('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(incomingRawPassword, 10);

    try {
      const { password: _, ...newUser } = await this.memberService.create({
        name,
        email,
        password: hashedPassword,
      });

      const payload = { email, id: newUser.id };

      return {
        accessToken: await this.jwtService.signAsync(payload),
        user: newUser,
      };
    } catch (error) {
      if (
        error.name === 'ConditionalCheckFailedException' ||
        error.message.includes('duplicate') ||
        error.code === 'ValidationException'
      ) {
        throw new ConflictException('Email already exists');
      }

      console.error('Signup error:', error);
      throw new InternalServerErrorException(
        'Something went wrong during signup',
      );
    }
  }

  async isCompanyEmail(email: string) {
    return CompanyEmailValidator.isCompanyEmail(email);
  }
}
