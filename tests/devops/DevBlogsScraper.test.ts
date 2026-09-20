import { testScraper } from '../utils';

import { DevBlogsScraper } from '@src/shared/DevBlogsScraper';

test('DevBlogs / Windows Command Line', async () => {
  await testScraper(new DevBlogsScraper('commandline'));
});

test('DevBlogs / PowerShell Team', async () => {
  await testScraper(new DevBlogsScraper('powershell'));
});
