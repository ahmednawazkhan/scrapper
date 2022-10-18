import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PasswordService } from 'src/auth/password.service';

@Module({
  imports: [],
  providers: [UsersService, PasswordService],
})
export class UsersModule {}
