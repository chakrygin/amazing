import dayjs from 'dayjs';

export interface LastErrorInfo {
  readonly timestamp: dayjs.Dayjs;
  readonly message: string;
  readonly counter: number;
}
