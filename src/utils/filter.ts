import {isNil} from 'lodash';

export function isPassingKeyValueFilter(target: any, keyValueFilter: Record<string, string | null>) {
  return Object.entries(keyValueFilter).every(([key, value]) => {
    if (!target[key]) {
      return false;
    }
    if (value !== null) {
      return target[key] === value;
    }
    return true;
  });
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return !isNil(value);
}
