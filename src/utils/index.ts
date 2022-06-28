import {DateTime} from 'luxon';

let lastId: number = 0;

export const generateId = (prefix: string = 'id'): string => {
  lastId += 1;
  return `${prefix}${lastId}`;
};

export const uniqueArr = <T>(arr: Array<T>): Array<T> => {
  return Array.from(new Set(arr));
};

export const getRelativeDate = (isoDate: string | undefined) => {
  if (isoDate) {
    return DateTime.fromISO(isoDate).toRelative();
  }
  return '';
};
