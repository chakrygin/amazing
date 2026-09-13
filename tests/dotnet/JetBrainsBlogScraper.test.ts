import { testScraper } from '../utils';

import { JetBrainsBlogScraper } from '@src/dotnet/JetBrainsBlogScraper';

test('JetBrains / .NET Tools', async () => {
  await testScraper(new JetBrainsBlogScraper());
});
