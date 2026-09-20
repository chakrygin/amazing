import dayjs from 'dayjs';
import RssParser from 'rss-parser';

import { Link, Post } from '@core/models';
import { ScraperBase } from '@core/scrapers';

type RssParserItem = RssParser.Item & { 'content:encoded': unknown };

export class CodeOpinionScraper extends ScraperBase {
  readonly name = 'CodeOpinion';
  readonly path = 'codeopinion.com';
  readonly author = 'Derek Comartin';

  private readonly CodeOpinion: Link = {
    title: 'CodeOpinion',
    href: 'https://codeopinion.com',
  };

  protected fetch(): AsyncGenerator<Post> {
    return this
      .fromRssFeed(this.CodeOpinion.href + '/feed/', {
        customFields: {
          item: [
            ['content:encoded', 'content:encoded'],
          ],
        },
      })
      .fetch((_, item) => {

        const content = item['content:encoded'] as string;
        const lines = content.split('\n');

        return {
          image: getImage(lines),
          title: item.title ?? '',
          href: item.link ?? '',
          categories: [this.CodeOpinion],
          author: this.author,
          date: getDate(item),
          description: getDescription(lines),
          tags: getTags(item),
        };

      });
  }
}

function getImage(lines: readonly string[]): string | undefined {
  const search = 'https://youtu.be/';
  for (const line of lines) {
    const startIndex = line.indexOf(search);
    if (startIndex > 0) {
      const endIndex = line.indexOf('"', startIndex + search.length);
      if (endIndex > startIndex) {
        const id = line.substring(startIndex + search.length, endIndex);
        return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
      }
    }
  }
}

function getDate(item: RssParserItem): dayjs.Dayjs {
  const date = item.pubDate ?? '';
  return dayjs(date);
}

function getDescription(lines: readonly string[]): string[] {
  const description = [];

  for (let line of lines) {
    if (line === '<p></p>') {
      continue;
    }

    if (line.indexOf('wp-block-heading') > 0) {
      break;
    }

    line = stripHtml(line).trim();

    if (line) {
      description.push(line);

      if (description.length >= 3) {
        break;
      }
    }
  }

  return description;

  function stripHtml(html: string): string {
    return html.replace(/<\/?[^>]+>/gi, '');
  };
}

function getTags(item: RssParserItem): string[] | undefined {
  const categories = item.categories;

  if (categories) {
    const tags = categories
      .filter(x => x !== 'Uncategorized');

    return tags;
  }
}
