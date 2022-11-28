import log from 'loglevel';
import {DateTime} from 'luxon';

const units = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'];

export const timeAgo = (date: string) => {
  try {
    let dateTime = DateTime.fromISO(date);
    const diff = dateTime.diffNow().shiftTo(...(units as any));
    const unit = units.find((u: string) => diff.get(u as any) !== 0) || 'second';

    const relativeFormatter = new Intl.RelativeTimeFormat('en', {
      numeric: 'auto',
      style: 'short',
    });
    return relativeFormatter.format(Math.trunc(diff.as(unit as any)), unit as any);
  } catch (error: any) {
    log.warn(error.message);
    return '-';
  }
};
