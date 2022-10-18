import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { SignupInput } from './dto/signup.input';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() signupInput: SignupInput) {
    return this.authService.createUser(signupInput);
  }

  @Post('login')
  login(@Body() loginInput: LoginInput) {
    return this.authService.login(loginInput);
  }
}
