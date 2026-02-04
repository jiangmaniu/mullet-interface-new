import dayjs from 'dayjs'

export const DATE = {
  DATE_TODAY: dayjs().format('YYYY-MM-DD'),
  DATE_YESTERDAY: dayjs().subtract(1, 'days').format('YYYY-MM-DD'),
  DATE_1_WEEK_BEFORE: dayjs().subtract(1, 'weeks').format('YYYY-MM-DD'),
  DATE_2_WEEKS_BEFORE: dayjs().subtract(2, 'weeks').format('YYYY-MM-DD'),
  DATE_3_WEEKS_BEFORE: dayjs().subtract(3, 'weeks').format('YYYY-MM-DD'),
  DATE_1_MONTH_BEFORE: dayjs().subtract(1, 'months').format('YYYY-MM-DD'),
  DATE_2_MONTH_BEFORE: dayjs().subtract(2, 'months').format('YYYY-MM-DD'),
  DATE_3_MONTHS_BEFORE: dayjs().subtract(3, 'months').format('YYYY-MM-DD'),
  DATE_1_YEAR_BEFORE: dayjs().subtract(1, 'years').format('YYYY-MM-DD'),

  DATE_3_MONTHS_AFTER: dayjs().add(3, 'months').format('YYYY-MM-DD'),
  DATE_2_MONTHS_AFTER: dayjs().add(2, 'months').format('YYYY-MM-DD'),
  DATE_1_MONTHS_AFTER: dayjs().add(1, 'months').format('YYYY-MM-DD'),
  DATE_1_WEEK_AFTER: dayjs().add(1, 'weeks').format('YYYY-MM-DD'),
  DATE_1_YEAR_AFTER: dayjs().add(1, 'year').format('YYYY-MM-DD'),

  DATE_FIRST_DAY_OF_MONTH: dayjs().startOf('month').format('YYYY-MM-DD'),
  DATE_LAST_DAY_OF_MONTH: dayjs().endOf('month').format('YYYY-MM-DD'),

  DATE_7_DAYS_BEFORE: dayjs().subtract(7, 'days').format('YYYY-MM-DD'),
  DATE_30_DAYS_BEFORE: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
  DATE_90_DAYS_BEFORE: dayjs().subtract(90, 'days').format('YYYY-MM-DD'),
  DATE_100_DAYS_BEFORE: dayjs().subtract(100, 'days').format('YYYY-MM-DD')
}
