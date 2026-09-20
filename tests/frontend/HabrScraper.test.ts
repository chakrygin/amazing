import { testScraper } from '../utils';

import { HabrScraper } from '@src/shared/HabrScraper';

test('Habr / JavaScript', async () => {
  await testScraper(new HabrScraper('javascript'));
});

test('Habr / TypeScript', async () => {
  await testScraper(new HabrScraper('typescript'));
});
