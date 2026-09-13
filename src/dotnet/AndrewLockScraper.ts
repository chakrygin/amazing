import dayjs from 'dayjs';
import RssParser from 'rss-parser';

import { Link, Post } from '@core/models';
import { ScraperBase } from '@core/scrapers';

type RssParserItem = RssParser.Item & { 'media:content': unknown };

export class AndrewLockScraper extends ScraperBase {
  readonly name = 'AndrewLock';
  readonly path = 'andrewlock.net';
  readonly author = 'Andrew Lock';

  private readonly AndrewLock: Link = {
    title: '.NET Escapades',
    href: 'https://andrewlock.net',
  };

  protected override fetch(): AsyncGenerator<Post> {
    return this
      .fromRssFeed(this.AndrewLock.href + '/rss.xml', {
        customFields: {
          item: [
            ['media:content', 'media:content'],
          ],
        },
      })
      .fetch((_, item) => {

        return {
          image: getImage(item),
          title: item.title ?? '',
          href: item.link ?? '',
          categories: [this.AndrewLock],
          author: this.author,
          date: getDate(item),
          description: getDescription(item),
          tags: getTags(item),
        };

      });
  }
}

function getImage(item: RssParserItem): string | undefined {
  const content = item['media:content'] as {
    readonly $: {
      readonly medium: string;
      readonly url: string;
    };
  };

  if (content.$.medium === 'image') {
    return content.$.url;
  }
}

function getDate(item: RssParserItem): dayjs.Dayjs {
  const date = item.isoDate ?? '';
  return dayjs(date);
}

function getDescription(item: RssParserItem): string[] {
  let description = item.contentSnippet?.trim() ?? '';

  if (!description.endsWith('.')) {
    description += '.';
  }

  return [description];
}

function getTags(item: RssParserItem): string[] | undefined {
  const categories = item.categories;

  if (categories) {
    const tags = categories
      .map(x => x.split(';'))
      .flat();

    return tags;
  }
}
