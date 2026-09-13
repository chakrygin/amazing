import * as cheerio from 'cheerio';
import { Element } from 'domhandler';
import dayjs from 'dayjs';

import { Link, Post } from '@core/models';
import { ScraperBase } from '@core/scrapers';

export class StevenGieselScraper extends ScraperBase {
  readonly name = 'StevenGiesel';
  readonly path = 'steven-giesel.com';

  private readonly StevenGiesel: Link = {
    title: 'Steven Giesel',
    href: 'https://steven-giesel.com',
  };

  protected override fetch(): AsyncGenerator<Post> {
    return this
      .fromHtmlPage(this.StevenGiesel.href)
      .fetch('main article .blog-card', ($, element) => {

        const image = element.find('.meta .photo img').attr('src') ?? '';
        const title = element.find('.description h4.card-title').text();
        const href = element.find('.description .read-more a').attr('href') ?? '';
        const date = element.find('.meta .details .date').text();
        const tags = element
          .find('.meta .details .tags .goto-tag')
          .map((_, tags) => $(tags).text())
          .toArray();

        return {
          image,
          title,
          href: this.getFullHref(this.StevenGiesel.href, href),
          categories: [this.StevenGiesel],
          date: dayjs(date, 'MM/DD/YYYY', 'en'),
          description: getDescription($, element),
          tags,
        };

      });
  }
}

function getDescription($: cheerio.CheerioAPI, element: cheerio.Cheerio<Element>): string[] {
  const description = [];
  const children = element
    .find('.description')
    .children();

  for (const child of children) {
    if (child.name === 'p') {
      const p = $(child);
      if (p.hasClass('read-more')) {
        break;
      }

      const text = p.text().trim();
      if (text) {
        description.push(text);
      }
    }
    else if (description.length > 0) {
      break;
    }
  }

  return description;
}
