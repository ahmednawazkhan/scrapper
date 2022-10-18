import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PasswordService } from 'src/auth/password.service';
import { UsersRepository } from './users.repository';

@Module({
  imports: [],
  providers: [UsersService, PasswordService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
