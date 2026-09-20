import dayjs from 'dayjs';

import { Link } from './Link';

export interface Post {
  readonly image?: string;
  readonly title: string;
  readonly href: string;
  readonly categories: Link[];
  readonly author?: string;
  readonly date?: dayjs.Dayjs;
  readonly description?: string[];
  readonly links?: Link[];
  readonly tags?: string[];
}
