import { testScraper } from '../utils';

import { HabrScraper } from '@src/shared/HabrScraper';

test('Habr / DevOps', async () => {
  await testScraper(new HabrScraper('devops'));
});

test('Habr / IT-инфраструктура', async () => {
  await testScraper(new HabrScraper('it-infrastructure'));
});

test('Habr / Kubernetes', async () => {
  await testScraper(new HabrScraper('kubernetes'));
});

test('Habr / PostgreSQL', async () => {
  await testScraper(new HabrScraper('postgresql'));
});
