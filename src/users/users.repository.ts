import { PrismaService } from 'nestjs-prisma';
import { Injectable } from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';
import { SignupInput } from 'src/auth/dto/signup.input';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  updateUser(userId: string, newUserData: UpdateUserInput) {
    return this.prisma.user.update({
      data: newUserData,
      where: {
        id: userId,
      },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email },
    });
  }

  create(signupInput: SignupInput) {
    return this.prisma.user.create({
      data: {
        ...signupInput,
        role: 'USER',
      },
    });
  }
}
