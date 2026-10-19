import { testScraper } from '../utils';

import { HabrScraper } from '@src/shared/HabrScraper';

test('Habr / Искусственный интеллект', async () => {
  await testScraper(new HabrScraper('artificial_intelligence'));
});
