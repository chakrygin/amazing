import * as core from '@actions/core';

import dayjs from 'dayjs';
import RssParser from 'rss-parser';

import { Scraper } from './Scraper';
import { ScraperStrategy } from './ScraperStrategy';
import { mergePost, printPost } from './ScraperUtils';

import { Post } from '../models';
import { Sender } from '../senders';
import { Storage } from '../storages';
import { HtmlPageHelper, NuxtDataHelper, RssFeedHelper } from './helpers';

export abstract class ScraperBase implements Scraper {
  constructor(
    private readonly strategy: ScraperStrategy = ScraperStrategy.BreakIfPostExists) { }

  #knownHosts: readonly string[] = [];

  abstract readonly name: string;
  abstract readonly path: string;

  scrape(sender: Sender, storage: Storage, knownHosts: readonly string[]): Promise<void> {
    this.#knownHosts = knownHosts;

    if (this.strategy == ScraperStrategy.BreakIfPostExists) {
      return this.scrapeWithBreakIfPostExists(sender, storage);
    }

    if (this.strategy == ScraperStrategy.ContinueIfPostExists) {
      return this.scrapeWithContinueIfPostExists(sender, storage);
    }

    throw new Error(`Unknown scraper strategy: ${String(this.strategy)}`);
  }

  private async scrapeWithBreakIfPostExists(sender: Sender, storage: Storage): Promise<void> {
    let firstDate: dayjs.Dayjs | undefined;

    for await (let post of this.fetch()) {
      core.info(post.title.trim());
      core.info(post.href.trim());

      if (storage.has(post.href)) {
        core.info('The post already exists in the storage. Break scraping.');
        break;
      }

      if (this.enrich !== ScraperBase.prototype.enrich) {
        const patch = await this.enrich(post);
        if (!patch) {
          core.info('The post is not interesting. Continue scraping.');
          continue;
        }

        post = mergePost(post, patch);
      }

      if (!firstDate) {
        firstDate = post.date;
      }
      else if (firstDate.diff(post.date, 'day') >= 1) {
        core.info('The post is too old. Break scraping.');
        break;
      }

      printPost(post);

      core.info('Sending the post...');
      await sender.send(post);

      core.info('Storing the post...');
      storage.add(post.href);
    }
  }

  private async scrapeWithContinueIfPostExists(sender: Sender, storage: Storage): Promise<void> {
    for await (let post of this.fetch()) {
      core.info(post.title.trim());
      core.info(post.href.trim());

      if (storage.has(post.href)) {
        core.info('The post already exists in the storage. Continue scraping.');
        continue;
      }

      if (this.enrich !== ScraperBase.prototype.enrich) {
        const patch = await this.enrich(post);
        if (!patch) {
          core.info('The post is not interesting. Continue scraping.');
          continue;
        }

        post = mergePost(post, patch);
      }

      printPost(post);

      core.info('Sending the post...');
      await sender.send(post);

      core.info('Storing the post...');
      storage.add(post.href);
    }
  }

  protected abstract fetch(): AsyncGenerator<Post>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected enrich(post: Post): Promise<Partial<Post> | false> {
    throw new Error();
  }

  protected fromHtmlPage(url: string): HtmlPageHelper {
    return new HtmlPageHelper(url);
  }

  protected fromNuxtData(url: string, trustCertificate = false): NuxtDataHelper {
    return new NuxtDataHelper(url, trustCertificate);
  }

  protected fromRssFeed<TFeed, TItem>(url: string, options: RssParser.ParserOptions<TFeed, TItem> = {}): RssFeedHelper<TFeed, TItem> {
    return new RssFeedHelper<TFeed, TItem>(url, options);
  }

  protected getFullHref(base: string, href: string): string {
    return href.startsWith('/')
      ? base + href
      : href;
  }

  protected isKnownHost(href: string): boolean {
    for (const knownHost of this.#knownHosts) {
      if (href.indexOf(knownHost) > 0) {
        return true;
      }
    }

    return false;
  }
}
