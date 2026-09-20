import { testScraper } from '../utils';

import { AndrewLockScraper } from '@src/dotnet/AndrewLockScraper';

test('AndrewLock', async () => {
  await testScraper(new AndrewLockScraper());
});
