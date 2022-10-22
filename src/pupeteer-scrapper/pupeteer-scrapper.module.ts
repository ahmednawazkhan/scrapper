import { Module } from '@nestjs/common';
import { PuppeteerModule } from 'nest-puppeteer';
import { PupeteerScrapperController } from './pupeteer-scrapper.controller';
import { PupeteerScrapperService } from './pupeteer-scrapper.service';

@Module({
  imports: [
    PuppeteerModule.forRoot(
      { pipe: true }, // optional, any Puppeteer launch options here or leave empty for good defaults */,
      'MyChromeInstance', // optional, can be useful for using Chrome and Firefox in the same project
    ),
  ],
  providers: [PupeteerScrapperService],
  controllers: [PupeteerScrapperController],
})
export class PupeteerScrapperModule {}
