import * as core from '@actions/core';

import dayjs from 'dayjs';
import { Element } from 'domhandler';
import * as cheerio from 'cheerio';

import { ScraperBase } from '@core/scrapers/ScraperBase';
import { ScraperStrategy } from '@core/scrapers';
import { Link, Post } from '@core/models';

import { Options } from './HabrScraperOptions';

export class HabrScraper extends ScraperBase {
  constructor(
    private readonly id: keyof typeof Options,
    private readonly options = Options[id]) {

    super(ScraperStrategy.ContinueIfPostExists);

    this.options = Options[id];

    this.name = `Habr / ${this.options.title}`;
    this.path = 'habr.com';
    this.href = `https://habr.com/ru/hubs/${id}/articles/`;
  }

  readonly name: string;
  readonly path: string;
  readonly href: string;

  private readonly Habr: Link = {
    title: 'Хабр',
    href: 'https://habr.com',
  };

  protected override fetch(): AsyncGenerator<Post> {
    return this
      .fromHtmlPage(this.href)
      .fetch('#app main .tm-articles-list article.tm-articles-list__item', ($, element) => {

        const ratingText = element.find('.tm-votes-meter__value').text();
        const rating = parseInt(ratingText);

        if (isNaN(rating)) {
          throw new Error('Failed to parse post. Rating is NaN.');
        }

        if (rating < this.options.minRating) {
          core.info('Post rating is too low. Continue scraping.');
          return false;
        }

        const image = this.getImage(element);
        const link = element.find('a.tm-title__link');
        const title = link.text();
        const href = link.attr('href') ?? '';
        const date = element.find('.tm-article-datetime-published time').attr('datetime') ?? '';
        const [categories, tags] = this.getCategoriesAndTags($, element);
        const description = this.getDescription($, element);

        return {
          image,
          title,
          href: this.getFullHref(this.Habr.href, href),
          categories: [this.Habr, ...categories],
          date: dayjs(date).locale('ru'),
          description,
          tags,
        };

      });
  }

  private getImage(element: cheerio.Cheerio<Element>): string | undefined {
    const src =
      element.find('img.tm-article-snippet__lead-image').attr('src') ??
      element.find('.article-formatted-body img:first-child').attr('src');

    return src;
  }

  private getCategoriesAndTags($: cheerio.CheerioAPI, element: cheerio.Cheerio<Element>): [Link[], string[]] {
    const categories: Link[] = [];
    const tags: string[] = [];
    const hubs = element
      .find('.tm-publication-hubs .tm-publication-hub__link-container a');

    for (const hub of hubs) {
      const link = $(hub);
      const title = link.text().replace('*', '');
      const href = link.attr('href') ?? '';

      if (title.startsWith('Блог компании')) {
        categories.push({
          title,
          href: this.getFullHref(this.Habr.href, href),
        });
      }
      else {
        tags.push(title);
      }
    }

    return [categories, tags];
  }

  private getDescription($: cheerio.CheerioAPI, element: cheerio.Cheerio<Element>): string[] {
    const description = [];
    const body = element
      .find('.article-formatted-body');

    if (body.hasClass('article-formatted-body_version-1')) {
      const lines = body
        .text()
        .split('\n')
        .map(line => line.trim())
        .filter(line => !!line);

      for (const line of lines) {
        description.push(line);

        if (description.length >= 5) {
          break;
        }
      }
    }
    else if (body.hasClass('article-formatted-body_version-2')) {
      const children = body.children();

      for (const child of children) {
        if (child.name == 'p') {
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
    }

    return description;
  }
}
