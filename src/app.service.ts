import { Injectable } from '@nestjs/common';
import { InjectBrowser } from 'nest-puppeteer';
import { Browser, ElementHandle, Page } from 'puppeteer';

declare let therapistDataExport: any;
declare let document: any;
@Injectable()
export class AppService {
  constructor(
    @InjectBrowser('MyChromeInstance') private readonly browser: Browser,
  ) {}
  async getHello() {
    try {
      const page = await this.browser.newPage();
      await page.setViewport({ width: 1200, height: 720 });
      await page.goto(
        'https://portal.therapyappointment.com/index.cfm/public',
        {
          waitUntil: 'networkidle0',
        },
      );
      await page.type('#user_username', 'lalachka');
      await page.type('#user_password', 'Dfdfdfdf11#');

      // const button = await page.$x("//button[contains(., 'Sign In')]");
      // console.log(button);
      const allResultsSelector = '.btn.btn-action';
      await page.waitForSelector(allResultsSelector);
      await page.click(allResultsSelector);
      // if (button) {
      //   await button.click();
      // }
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      await page.goto(
        'https://portal.therapyappointment.com/index.cfm/people:user/listStaff',
        {
          waitUntil: 'networkidle0',
        },
      );

      await this.clickByText(page, `Natalie Rynda`);
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      await page.evaluate(() => {
        // therapistDataExport.export('appointments');
        // therapistDataExport.export('chart');
        // therapistDataExport.export('contacts');
      });

      const downloadLink = await page.evaluate(() => {
        const xpath = "//h5[text()='Client Appointments']";
        const matchingElement = document.evaluate(
          xpath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null,
        ).singleNodeValue;
        const link =
          matchingElement.nextElementSibling.nextElementSibling.children[0]
            .href;
        return link;
      });
      const client = await page.target().createCDPSession();
      await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: './downloads',
      });
      await page.evaluate((downloadLink) => {
        location.href = downloadLink;
      }, downloadLink);
      await page.screenshot({ path: './screen.jpeg' });
      console.log('done');
    } catch (e) {
      console.log(e);
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
}
