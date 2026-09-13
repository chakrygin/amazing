import * as dotenv from 'dotenv';

dotenv.config({
  path: 'debug.env',
  quiet: true,
});

// ========================================

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);
dayjs.locale('en');
