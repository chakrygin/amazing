import * as core from '@actions/core';

import RssParser from 'rss-parser';

import { Post } from '../../models';

export class RssFeedHelper<TFeed, TItem> {
  constructor(
    private readonly url: string,
    private readonly options: RssParser.ParserOptions<TFeed, TItem>) { }

  async * fetch(parse: (
    feed: RssParser.Output<TItem> & TFeed, item: RssParser.Item & TItem) => Post
  ): AsyncGenerator<Post> {
    core.info(`Parsing rss feed by url ${this.url}`);

    const parser = new RssParser(this.options);
    const feed = await parser.parseURL(this.url);

    if (feed.items.length == 0) {
      throw new Error('Failed to parse rss feed. No posts found.');
    }

    for (let index = 0; index < feed.items.length; index++) {
      core.info('========================================');
      core.info(`Parsing post at index ${String(index)}`);

      const item = feed.items[index];
      const post = parse(feed, item);

      yield post;
    }
  }
}
