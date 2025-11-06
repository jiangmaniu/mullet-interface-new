import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(relativeTime)
dayjs.extend(duration)

export enum TimeParseEnum {
  default = 'YYYY-MM-DD HH:mm:ss',
}
export enum TimeFormatEnum {
  default = 'YYYY-MM-DD HH:mm:ss',
  utc = 'YYYY-MM-DD HH:mm:ss (UTC)',
  otc = 'MMM D, YYYY HH:mm (UTC)',
}

export { dayjs }
