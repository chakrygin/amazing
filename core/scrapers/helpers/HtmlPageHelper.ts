import * as core from '@actions/core';

import axios from 'axios';
import * as cheerio from 'cheerio';
import { Element } from 'domhandler';

import { Post } from '../../models';

export class HtmlPageHelper {
  constructor(
    private readonly url: string) { }

  async * fetch(
    selector: string,
    parse: ($: cheerio.CheerioAPI, element: cheerio.Cheerio<Element>) => Post | false
  ): AsyncGenerator<Post> {
    core.info(`Parsing html page by url ${this.url}`);

    const response = await axios.get(this.url);
    const $ = cheerio.load(response.data as string);
    const elements = $<Element, string>(selector);

    if (elements.length == 0) {
      throw new Error('Failed to parse html page. No posts found.');
    }

    for (let index = 0; index < elements.length; index++) {
      core.info('');
      core.info('========================================');
      core.info('');
      core.info(`Parsing post at index ${String(index)}`);

      const element = $(elements[index]);
      const post = parse($, element);

      if (post) {
        yield post;
      }
    }
  }

  async enrich<T extends Partial<Post> | false>(
    selector: string,
    parse: ($: cheerio.CheerioAPI, element: cheerio.Cheerio<Element>) => T
  ): Promise<T> {
    core.info(`Parsing html page by url ${this.url}...`);

    const response = await axios.get(this.url);
    const $ = cheerio.load(response.data as string);
    const elements = $<Element, string>(selector);

    if (elements.length == 0) {
      throw new Error('Failed to parse html page. No posts found.');
    }

    if (elements.length > 1) {
      throw new Error('Failed to parse html page. More than one post found.');
    }

    const element = $(elements[0]);
    const patch = parse($, element);

    return patch;
  }
}
