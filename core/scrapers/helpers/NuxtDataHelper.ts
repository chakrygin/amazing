import * as core from '@actions/core';

import axios from 'axios';
import https from 'https';

import { Post } from '../../models';

export class NuxtDataHelper {
  constructor(
    private readonly url: string,
    private readonly trustCertificate: boolean) { }

  async * fetch<T>(parse: (data: T) => Generator<Post>): AsyncGenerator<Post> {
    core.info(`Parsing html page by url ${this.url}...`);

    const response = !this.trustCertificate
      ? await axios.get(this.url)
      : await axios.get(this.url, {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      });

    const html = response.data as string;

    const rawNuxtData = this.getRawNuxtData(html);
    if (!rawNuxtData) {
      throw new Error('Failed to parse html page. Nuxt data element not found.');
    }

    const encodedNuxtData = JSON.parse(rawNuxtData) as unknown;
    if (!Array.isArray(encodedNuxtData)) {
      throw new Error('Failed to parse html page. Nuxt data element is not an array.');
    }

    const decodedNuxtData = this.getDecodedNuxtData(encodedNuxtData);
    if (!decodedNuxtData) {
      throw new Error('Failed to parse html page. Nuxt data element is not valid.');
    }

    for (const post of parse(decodedNuxtData as T)) {
      core.info('');
      core.info('========================================');
      core.info('');

      yield post;
    }
  }

  private getRawNuxtData(html: string): string | undefined {
    const index = html.indexOf('__NUXT_DATA__');
    if (index > 0) {
      const startIndex = html.indexOf('>', index);
      if (startIndex > 0) {
        const endIndex = html.indexOf('</script>', startIndex);
        if (endIndex > 0) {
          return html.substring(startIndex + 1, endIndex);
        }
      }
    }
  }

  private getDecodedNuxtData(data: readonly unknown[]): unknown {
    return decode(0);

    function decode(index: number): unknown {
      const value = data[index];

      if (value === null) {
        return null;
      }

      if (Array.isArray(value)) {
        if (value.length == 1) {
          const item = value[0] as unknown;

          if (typeof item === 'string') {
            if (item === 'Set') {
              return value;
            }
          }
        }
        else if (value.length == 2) {
          const item0 = value[0] as unknown;
          const item1 = value[1] as unknown;

          if (typeof item0 === 'string' && typeof item1 === 'number') {
            if (item0 === 'Reactive' || item0 === 'ShallowReactive') {
              return decode(item1);
            }
          }
        }

        const result = value
          .map((item) => {
            if (typeof item !== 'number') {
              const json = JSON.stringify(value, null, '  ');
              throw new Error(`Failed to decode nuxt data at index ${String(index)}: ${json}`);
            }

            return decode(item);
          });

        return result;
      }

      if (typeof value === 'object') {
        const result = Object
          .entries(value)
          .map(entry => {
            const key = entry[0];
            const item = entry[1] as unknown;

            if (typeof item !== 'number') {
              const json = JSON.stringify(value, null, '  ');
              throw new Error(`Failed to decode nuxt data at index ${String(index)}: ${json}`);
            }

            return [key, decode(item)];
          });

        return Object.fromEntries(result);
      }

      return value;
    }
  }
}
