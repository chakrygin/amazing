import path from 'path';

import { Scraper } from '@core/scrapers';
import { DataStorage } from '@core/storages';
import { createSender, createTelegram, getInput } from '@core/AppUtils';

export async function testScraper(scraper: Scraper): Promise<void> {
  const telegram = createTelegram();
  const sender = createSender(telegram, 'PRIVATE');

  const category = getInput('TEST_CATEGORY');
  const storage = new DataStorage(
    path.join(process.cwd(), 'data', category));

  await scraper.scrape(sender, storage, storage.knownHosts);
}
