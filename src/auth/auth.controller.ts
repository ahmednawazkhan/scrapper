import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { SignupInput } from './dto/signup.input';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  signup(@Body() signupInput: SignupInput) {
    return this.authService.createUser(signupInput);
  }

  @Post('login')
  login(@Body() loginInput: LoginInput) {
    return this.authService.login(loginInput);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me() {
    return 'me';
  }
}
