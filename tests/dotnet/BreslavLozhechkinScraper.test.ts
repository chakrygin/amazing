import { testScraper } from '../utils';

import { BreslavLozhechkinScraper } from '@src/dotnet/BreslavLozhechkinScraper';

test('BreslavLozhechkin', async () => {
  await testScraper(new BreslavLozhechkinScraper());
});
