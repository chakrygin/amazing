import { Element } from 'domhandler';
import * as cheerio from 'cheerio';

import { Post } from '../../models';
import { HtmlPageHelper } from './HtmlPageHelper';

export class HtmlPagesHelper {
  readonly #urls: readonly string[];

  constructor(urls: readonly string[]) {
    this.#urls = urls;
  }

  async * fetch(
    selector: string,
    parse: ($: cheerio.CheerioAPI, element: cheerio.Cheerio<Element>) => Post | false
  ): AsyncGenerator<Post> {
    for (const url of this.#urls) {
      const helper = new HtmlPageHelper(url);
      yield* helper.fetch(selector, parse);
    }
  }
}
