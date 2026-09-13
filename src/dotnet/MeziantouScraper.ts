import * as core from '@actions/core';

import * as cheerio from 'cheerio';
import { Element } from 'domhandler';
import dayjs from 'dayjs';

import { Link, Post } from '@core/models';
import { ScraperBase } from '@core/scrapers';

export class MeziantouScraper extends ScraperBase {
  readonly name = 'Meziantou';
  readonly path = 'meziantou.net';
  readonly author = 'Gérald Barré';

  private readonly Meziantou: Link = {
    title: 'Meziantou\'s blog',
    href: 'https://www.meziantou.net',
  };

  protected override fetch(): AsyncGenerator<Post> {
    return this
      .fromHtmlPage(this.Meziantou.href)
      .fetch('main article', ($, element) => {

        const link = element.find('header>a');
        const title = link.text();
        const href = link.attr('href') ?? '';
        const date = element.find('header>div>div>time').text();
        const tags = element
          .find('header>div>div>ul a')
          .map((_, tag) => $(tag))
          .map((_, tag) => tag.text())
          .toArray();

        if (!tags.includes('.NET')) {
          core.info('Post does not have .NET tag. Continue scraping.');
          return false;
        }

        return {
          title,
          href: this.getFullHref(this.Meziantou.href, href),
          categories: [this.Meziantou],
          author: this.author,
          date: dayjs(date, 'MM/DD/YYYY'),
          tags,
        };

      });
  }

  protected override enrich(post: Post): Promise<Partial<Post>> {
    return this
      .fromHtmlPage(post.href)
      .enrich('main article', ($, element) => {

        return {
          description: getDescription($, element),
        };

      });
  }
}

function getDescription($: cheerio.CheerioAPI, element: cheerio.Cheerio<Element>): string[] {
  const description = [];
  const children = element
    .find('>div')
    .first()
    .children();

  for (const child of children) {
    if (child.name === 'p') {
      const p = $(child);
      const text = p.text().trim();

      if (text) {
        description.push(text);

        if (description.length >= 5) {
          break;
        }
      }
    }
    else if (description.length > 0) {
      break;
    }
  }

  return description;
}
