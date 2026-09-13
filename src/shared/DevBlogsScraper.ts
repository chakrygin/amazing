import * as cheerio from 'cheerio';
import { Element } from 'domhandler';
import dayjs from 'dayjs';

import { ScraperBase } from '@core/scrapers';
import { Link, Post } from '@core/models';

import { Options } from './DevBlogsScraperOptions';

export class DevBlogsScraper extends ScraperBase {
  constructor(
    private readonly id: keyof typeof Options,
    private readonly options = Options[id]) {

    super();

    this.name = `DevBlogs / ${options.title}`;
    this.path = `devblogs.microsoft.com/${id}`;

    this.DevBlog = {
      title: options.title,
      href: `https://devblogs.microsoft.com/${id}/`,
    };
  }

  readonly name: string;
  readonly path: string;

  private readonly DevBlogs: Link = {
    title: 'DevBlogs',
    href: 'https://devblogs.microsoft.com',
  };

  private readonly DevBlog: Link;

  protected override fetch(): AsyncGenerator<Post> {
    return this
      .fromHtmlPage(this.DevBlog.href)
      .fetch('main section div.masonry-container div.masonry-card', ($, element) => {

        const header = element.find('h3');
        const link = header.find('>a');
        const title = link.text();
        const href = link.attr('href') ?? '';
        const date = header
          .prev()
          .children()
          .first()
          .text();

        return {
          image: getImage(element),
          title,
          href,
          categories: [this.DevBlogs, this.DevBlog],
          date: dayjs(date, 'LL'),
        };

      });
  }

  protected override enrich(post: Post): Promise<Partial<Post>> {
    return this
      .fromHtmlPage(post.href)
      .enrich('main article>div.entry-content', ($, element) => {

        return {
          description: getDescription($, element),
        };

      });
  }
}

function getImage(element: cheerio.Cheerio<Element>): string | undefined {
  const image = element
    .find('div.masonry-thumbnail>img')
    .attr('data-src');

  if (image && !image.endsWith('.svg')) {
    return image;
  }
}

function getDescription($: cheerio.CheerioAPI, element: cheerio.Cheerio<Element>): string[] {
  const description: string[] = [];
  const children = element.children();

  if (children.length == 1) {
    return getDescription($, children.first());
  }

  for (const child of children) {
    if (child.name == 'p') {
      const text = $(child)
        .text()
        .replace(/\s+/g, ' ')
        .trim();

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
