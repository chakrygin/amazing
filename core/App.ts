import * as core from '@actions/core';

import dayjs from 'dayjs';
import 'dayjs/locale/ru.js';

import { initialize, createConfig, createTelegram, createSender, createStorage } from './AppUtils';

import { Scraper } from './scrapers';
import { DataStorage, LastErrorStorage, LastUpdateStorage } from './storages';

export class App {
  constructor(
    readonly scrapers: Record<string, readonly Scraper[]>) { }

  private readonly commitScraperNames: string[] = [];

  async run(): Promise<void> {
    try {

      initialize();

      const config = createConfig();
      const telegram = createTelegram();
      const privateSender = createSender(telegram, 'PRIVATE');

      const lastErrorStorage = createStorage(LastErrorStorage, config.path, 'errors.json');
      const lastUpdateStorage = createStorage(LastUpdateStorage, config.path, 'updates.json');

      for (const [category, scrapers] of Object.entries(this.scrapers)) {
        core.info('****************************************');
        core.info('** ' + category.padEnd(34) + ' **');
        core.info('****************************************');

        const publicSender = createSender(telegram, category);

        for (const scraper of scrapers) {
          await core.group(scraper.name, async () => {

            const lastError = lastErrorStorage.get(scraper.name);
            const lastUpdate = lastUpdateStorage.get(scraper.name);

            if (lastError) {
              if (!config.manual) {
                if (lastError.counter >= 10) {
                  core.error('This scraper failed more than 10 times.', {
                    title: `The '${scraper.name}' scraper permanently disabled.`,
                  });

                  return;
                }

                if (lastError.counter > 1) {
                  if (dayjs().diff(lastError.timestamp, 'days') < 1) {
                    core.warning('This scraper failed less than a day ago.', {
                      title: `The '${scraper.name}' scraper temporarily disabled.`,
                    });

                    return;
                  }
                }
              }

              lastErrorStorage.reset(scraper.name);
            }

            if (lastUpdate) {
              if (!config.manual) {
                if (dayjs().diff(lastUpdate.timestamp, 'year') >= 1) {
                  core.warning('This scraper has no updates more than 1 year.', {
                    title: `The '${scraper.name}' scraper is idle.`,
                  });
                }
              }
            }

            const storage = createStorage(DataStorage, config.path, category, scraper.path);

            const debug = config.debug || !lastUpdate || !storage.exists;
            const sender = !debug ? publicSender : privateSender;

            try {
              await scraper.scrape(sender, storage, storage.knownHosts);
            }
            catch (error) {
              if (error instanceof Error) {
                if (lastError) {
                  process.exitCode = 1;

                  core.error(error, {
                    title: `The '${scraper.name}' scraper failed.`,
                  });
                }
                else {
                  core.warning(error, {
                    title: `The '${scraper.name}' scraper failed.`,
                  });
                }

                lastErrorStorage.set(scraper.name, error);
              }
            }
            finally {
              if (storage.save()) {
                lastUpdateStorage.set(scraper.name);
                this.commitScraperNames.push(scraper.name);
              }
            }

          });
        }
      }

    }
    catch (error: unknown) {
      core.setFailed(error as Error);
    }
    finally {
      core.setOutput('COMMIT_MESSAGE', this.commitScraperNames.length > 0
        ? 'Scraped: ' + this.commitScraperNames.join(', ')
        : 'Scraped');
    }
  }
}
