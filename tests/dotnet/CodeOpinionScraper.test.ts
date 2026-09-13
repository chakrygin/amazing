import { testScraper } from '../utils';

import { CodeOpinionScraper } from '@src/dotnet/CodeOpinionScraper';

test('CodeOpinion', async () => {
  await testScraper(new CodeOpinionScraper());
});
