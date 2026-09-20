import { testScraper } from '../utils';

import { DevBlogsScraper } from '@src/shared/DevBlogsScraper';

test('DevBlogs / .NET Blog', async () => {
  await testScraper(new DevBlogsScraper('dotnet'));
});

test('DevBlogs / Visual Studio Blog', async () => {
  await testScraper(new DevBlogsScraper('visualstudio'));
});
