import { Injectable, Logger } from '@nestjs/common';
import { InjectBrowser } from 'nest-puppeteer';
import { Browser, ElementHandle, Page } from 'puppeteer';
import { ScrapperCredentials } from './dto/scrapper-credentials.dto';
import { ReportTypes } from './enum/report-types.enum';

declare let therapistDataExport: any;
declare let document: any;
@Injectable()
export class PupeteerScrapperService {
  private readonly logger = new Logger(PupeteerScrapperService.name);
  constructor(
    @InjectBrowser('MyChromeInstance') private readonly browser: Browser,
  ) {}
  async scrapeReports(scrapperCredentials: ScrapperCredentials) {
    const page = await this.browser.newPage();
    if (!page) return;
    try {
      await page.setViewport({ width: 1200, height: 720 });
      await page.goto(
        'https://portal.therapyappointment.com/index.cfm/public',
        {
          waitUntil: 'networkidle0',
        },
      );
      await page.type('#user_username', scrapperCredentials.username);
      await page.type('#user_password', scrapperCredentials.password);

      const allResultsSelector = '.btn.btn-action';
      await page.waitForSelector(allResultsSelector);
      await page.click(allResultsSelector);
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      this.logger.log(`logged in to app`);
      await page.goto(
        'https://portal.therapyappointment.com/index.cfm/people:user/listStaff',
        {
          waitUntil: 'networkidle0',
        },
      );

      await this.clickByText(page, scrapperCredentials.userNameClickLink);
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      await page
        .evaluate(() => {
          therapistDataExport.export('appointments');
          therapistDataExport.export('chart');
          therapistDataExport.export('contacts');
        })
        .catch(console.log);

      this.logger.log(`refreshed reports`);
      const client = await page.target().createCDPSession();
      await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: './downloads',
      });
      const reports: string[] = [];
      if (scrapperCredentials.reports?.length) {
        reports.push(...scrapperCredentials.reports);
      } else {
        reports.push(...Object.values(ReportTypes));
      }

      for (const report of reports) {
        this.logger.log(`started downloading ${report} report`);
        await this.getReportDownloadLink(page, report)
          .then((downloadLink) => {
            return page.evaluate((downloadLink) => {
              location.href = downloadLink;
            }, downloadLink);
          })
          .catch(this.logger.error);

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
      this.logger.log(`downloaded all reports`);
    } catch (e) {
      console.log(e);
    } finally {
      await page.close();
    }
  }

  escapeXpathString(str: string) {
    const splitedQuotes = str.replace(/'/g, `', "'", '`);
    return `concat('${splitedQuotes}', '')`;
  }
  async clickByText(page: Page, text: string) {
    const escapedText = this.escapeXpathString(text);
    const linkHandlers = await page.$x(`//a[contains(text(), ${escapedText})]`);

    if (linkHandlers.length > 0) {
      await (linkHandlers[0] as ElementHandle<HTMLElement>).click();
    } else {
      throw new Error(`Link not found: ${text}`);
    }
  }

  async getReportDownloadLink(page: Page, reportType: string): Promise<string> {
    return await page.evaluate((reportType) => {
      const xpath = `//h5[text()='${reportType}']`;
      const matchingElement = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
      ).singleNodeValue;
      const link =
        matchingElement.nextElementSibling.nextElementSibling.children[0].href;
      return link;
    }, reportType);
  }
}
