import { testScraper } from '../utils';

import { KubernetesScraper } from '@src/devops/KubernetesScraper';

test('Kubernetes', async () => {
  await testScraper(new KubernetesScraper());
});
