import { testScraper } from '../utils';

import { RadioDotNetScraper } from '@src/dotnet/RadioDotNetScraper';

test('RadioDotNet', async () => {
  await testScraper(new RadioDotNetScraper());
});
