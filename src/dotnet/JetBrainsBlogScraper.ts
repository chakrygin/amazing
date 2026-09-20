import * as core from '@actions/core';

import * as cheerio from 'cheerio';
import { Element } from 'domhandler';
import dayjs from 'dayjs';

import { Link, Post } from '@core/models';
import { ScraperBase } from '@core/scrapers';

export class JetBrainsBlogScraper extends ScraperBase {
  readonly name = 'JetBrains / .NET Tools';
  readonly path = 'blog.jetbrains.com/dotnet';

  private readonly JetBrainsBlog: Link = {
    title: 'The JetBrains Blog',
    href: 'https://blog.jetbrains.com',
  };

  private readonly DotNetTools: Link = {
    title: '.NET Tools',
    href: 'https://blog.jetbrains.com/dotnet/',
  };

  protected override fetch(): AsyncGenerator<Post> {
    return this
      .fromHtmlPage(this.DotNetTools.href)
      .fetch('#main .latest_posts_section .card', ($, element) => {

        const image = element.find('img.wp-post-image').attr('src');
        const title = element.find('h4').text();
        const href = element.attr('href') ?? '';
        const date = element.find('.card__footer time.publish-date').attr('datetime');

        const isInterestingPost =
          href.startsWith(this.DotNetTools.href) &&
          !title.includes('Webinar') &&
          !title.includes('Bug Fixes') &&
          !title.includes('Bug-fixes');

        if (!isInterestingPost) {
          core.info('The post is not interesting. Continue scraping.');
          return false;
        }

        return {
          image,
          title,
          href,
          categories: [this.JetBrainsBlog, this.DotNetTools],
          date: dayjs(date),
        };

      });
  }

  protected override enrich(post: Post): Promise<Partial<Post> | false> {
    return this
      .fromHtmlPage(post.href)
      .enrich('#main>.article-section', ($, element) => {

        const description = !post.title.includes('dotInsights')
          ? this.getDescription($, element)
          : this.getDotInsightsDescription($, element);

        const tags = this.getTags($, element);
        const isInterestingPost =
          !tags.includes('bugfix') &&
          !tags.includes('Webinars');

        if (!isInterestingPost) {
          core.info('The post is not interesting. Continue scraping.');
          return false;
        }

        return {
          description,
          tags,
        };

      });
  }

  private getDescription($: cheerio.CheerioAPI, element: cheerio.Cheerio<Element>): string[] {
    const description: string[] = [];
    const children = element
      .find('>.content')
      .children();

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

    return description;
  }

  private getDotInsightsDescription($: cheerio.CheerioAPI, element: cheerio.Cheerio<Element>): string[] {
    const description = [];
    const links = element
      .find('>.content>ul>li>a:first-child')
      .map((_, link) => $(link));

    for (const link of links) {
      const title = link.text();
      const href = link.attr('href');

      if (title && href && !this.isKnownHost(href)) {
        description.push(`${title}: ${href}`);

        if (description.length >= 10) {
          break;
        }
      }
    }

    return description;
  }

  private getTags($: cheerio.CheerioAPI, element: cheerio.Cheerio<Element>): string[] {
    const tags = element
      .find('.tag-list>a.tag')
      .map((_, tag) => $(tag).text())
      .toArray();

    return tags;
  }
}





