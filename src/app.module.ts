import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'nestjs-prisma';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import config from 'src/common/configs/config';
import { loggingMiddleware } from 'src/common/middleware/logging.middleware';
import { PuppeteerModule } from 'nest-puppeteer';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [loggingMiddleware(new Logger('PrismaMiddleware'))], // configure your prisma middleware
      },
    }),
    PuppeteerModule.forRoot(
      { pipe: true }, // optional, any Puppeteer launch options here or leave empty for good defaults */,
      'MyChromeInstance', // optional, can be useful for using Chrome and Firefox in the same project
    ),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
