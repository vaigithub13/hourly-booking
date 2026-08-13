import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import calendar from 'dayjs/plugin/calendar';
import duration from 'dayjs/plugin/duration';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';

dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(calendar);
dayjs.extend(duration);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

export const myDayjs = dayjs;

export const getMonthSpanDates = (year: number, month: number) => {
  if (!year || !month) {
    return [dayjs().format(), dayjs().format()];
  }
  // the passed month is 1-indexed from 1 to 12 but in dayjs months are 0-indexed
  const fromDate = myDayjs()
    .set('year', year)
    .set('month', month - 1)
    .set('date', 1)
    .format();
  const toDate = myDayjs()
    .set('year', year + (month === 12 ? 1 : 0))
    .set('month', month % 12)
    .set('date', 1)
    .format();
  return [fromDate, toDate];
};
