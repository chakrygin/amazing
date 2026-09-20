import { testScraper } from '../utils';

import { StevenGieselScraper } from '@src/dotnet/StevenGieselScraper';

test('StevenGiesel', async () => {
  await testScraper(new StevenGieselScraper());
});
