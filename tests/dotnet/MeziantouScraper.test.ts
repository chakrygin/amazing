import { testScraper } from '../utils';

import { MeziantouScraper } from '@src/dotnet/MeziantouScraper';

test('Meziantou', async () => {
  await testScraper(new MeziantouScraper());
});
