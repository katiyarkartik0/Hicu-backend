import {
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, UserDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async handleSignIn(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto);
  }

  @Post('signup')
  async handleSignUp(@Body() userDto: UserDto) {
    return this.authService.signup(userDto);
  }

  @Get('signup')
  async checkCompanyEmail(@Query('email') email: string) {
    return this.authService.isCompanyEmail(email);
  }
}