import { PrismaService } from 'nestjs-prisma';
import { Prisma, User } from '@prisma/client';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './password.service';
import { SignupInput } from './dto/signup.input';
import { Token } from './models/token.model';
import { SecurityConfig } from 'src/common/configs/config.interface';
import { UsersService } from 'src/users/users.service';
import { LoginInput } from './dto/login.input';
import { JWTPayload } from './models/JWTPayload';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {}

  async createUser(payload: SignupInput): Promise<Token> {
    const hashedPassword = await this.passwordService.hashPassword(
      payload.password,
    );

    try {
      const user = await this.userService.createUser({
        ...payload,
        password: hashedPassword,
      });

      return this.generateTokens({
        userId: user.id,
        firstName: user.firstname,
        lastName: user.lastname,
        role: user.role,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(`Email ${payload.email} already used.`);
      }
      throw new Error(e);
    }
  }

  async login(loginInput: LoginInput): Promise<Token> {
    const user = await this.userService.findByEmail(loginInput.email);

    if (!user) {
      throw new NotFoundException(
        `No user found for email: ${loginInput.email}`,
      );
    }

    const passwordValid = await this.passwordService.validatePassword(
      loginInput.password,
      user.password,
    );

    if (!passwordValid) {
      throw new BadRequestException('Invalid password');
    }

    return this.generateTokens({
      userId: user.id,
      firstName: user.firstname,
      lastName: user.lastname,
      role: user.role,
    });
  }

  validateUser(userId: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  getUserFromToken(token: string): Promise<User> {
    const id = this.jwtService.decode(token)['userId'];
    return this.prisma.user.findUnique({ where: { id } });
  }

  generateTokens(payload: JWTPayload): Token {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  private generateAccessToken(payload: JWTPayload): string {
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(payload: JWTPayload): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: securityConfig.refreshIn,
    });
  }

  refreshToken(token: string) {
    try {
      const { userId, firstName, lastName, role } = this.jwtService.verify(
        token,
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        },
      );

      return this.generateTokens({
        userId,
        firstName,
        lastName,
        role,
      });
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
