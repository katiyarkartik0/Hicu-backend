import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from 'src/user/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() { email, password }: UserDto) {
    return this.authService.signIn({ email, password });
  }

  @HttpCode(HttpStatus.OK)
  @Post('signup')
  signUp(@Body() { email, password }: UserDto) {
    return this.authService.signup({ email, password });
  }
}
