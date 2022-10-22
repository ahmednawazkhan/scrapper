import { Body, Controller, Post } from '@nestjs/common';
import { ScrapperCredentials } from './dto/scrapper-credentials.dto';
import { PupeteerScrapperService } from './pupeteer-scrapper.service';

@Controller('scrapper')
export class PupeteerScrapperController {
  constructor(private readonly pupeteerService: PupeteerScrapperService) {}

  @Post('scrape-reports')
  signup(@Body() scrapperCredentials: ScrapperCredentials) {
    return this.pupeteerService.scrapeReports(scrapperCredentials);
  }
}
