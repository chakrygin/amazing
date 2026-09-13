import * as cheerio from 'cheerio';
import dayjs from 'dayjs';

import { ScraperBase } from '@core/scrapers';
import { Link, Post } from '@core/models';

const trustCertificate = true;

export interface MaveScraperOptions {
  readonly name: string;
  readonly title: string;
  readonly image: string;
}

export abstract class MaveScraperBase extends ScraperBase {
  constructor(
    private readonly id: string,
    private readonly options: MaveScraperOptions) {
    super();

    this.name = this.options.name;
    this.path = `${this.id}.mave.digital`;

    this.Mave = {
      title: this.options.title,
      href: `https://${this.id}.mave.digital`,
    };
  }

  readonly name: string;
  readonly path: string;

  private readonly Mave: Link;

  protected fetch(): AsyncGenerator<Post> {
    return this
      .fromNuxtData(this.Mave.href, trustCertificate)
      .fetch<MaveData>((data) => {
        const podcast = data.data.fetchedPodcastData;
        const episodes = data.data.fetchedEpisodesData.episodes;
        return fetch.call(this, podcast, episodes);

        function* fetch(this: MaveScraperBase, podcast: MavePodcastData, episodes: MaveEpisodeData[]): Generator<Post> {
          for (const episode of episodes) {
            const description = this.getDescription(episode);
            const links = this.getLinks(podcast, episode);

            yield {
              image: this.options.image, // Telegram can not get image from https://cdn.mave.digital/
              title: `${String(episode.number)} выпуск. ${episode.title}`,
              href: `${this.Mave.href}/ep-${String(episode.code)}`,
              categories: [this.Mave],
              date: dayjs(episode.publish_date),
              description: typeof description === 'string' ? [description] : description,
              links: links,
            };
          }
        }
      });
  }

  protected abstract getDescription(episode: MaveEpisodeData): string | string[] | undefined;

  protected getDescriptionLines(episode: MaveEpisodeData): string[] {
    const $ = cheerio.load(episode.description);
    const result = $('body')
      .contents()
      .map((_, node) => $(node).text().trim())
      .filter((_, line) => line.length > 0)
      .toArray();

    return result;
  }

  protected abstract getLinks(podcast: MavePodcastData, episode: MaveEpisodeData): Link[] | undefined;

  protected getDefaultLinks(podcast: MavePodcastData, episode: MaveEpisodeData): Link[] {
    const links: Link[] = [];

    if (podcast.platforms.yandex) {
      links.push({
        title: 'Слушать на Яндекс.Музыке',
        href: podcast.platforms.yandex.replace('music.yandex.com', 'music.yandex.ru'),
      });
    }

    if (podcast.platforms.youtube) {
      links.push({
        title: 'Слушать на YouTube',
        href: podcast.platforms.youtube,
      });
    }

    links.push({
      title: 'Слушать на Mave',
      href: `${this.Mave.href}/ep-${String(episode.code)}`,
    });

    return links;
  }
}

export interface MaveData {
  data: {
    fetchedEpisodesData: MaveEpisodesData,
    fetchedPodcastData: MavePodcastData,
  }
}

export interface MaveEpisodesData {
  episodes: MaveEpisodeData[],
  total: number,
}

export interface MaveEpisodeData {
  number: number,
  title: string,
  description: string,
  image: string,
  code: number,
  publish_date: string,
}

export interface MavePodcastData {
  platforms: {
    yandex: string | null,
    youtube: string | null,
  }
}
