import { testScraper } from '../utils';

import { DevBlogsScraper } from '@src/shared/DevBlogsScraper';

test('DevBlogs / TypeScript', async () => {
  await testScraper(new DevBlogsScraper('typescript'));
});
