import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, UserDto } from 'src/user/dto/user.dto';
import { MemberService } from 'src/member/member.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
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
      throw new UnauthorizedException();
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
      const newUser = await this.memberService.create({
        name,
        email,
        password: hashedPassword,
      });

      const payload = { email };

      return {
        accessToken: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      // Check if it's a duplicate hash key error
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
}
