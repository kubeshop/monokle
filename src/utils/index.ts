const {which} = require('shelljs');

let lastId: number = 0;

export const generateId = (prefix: string = 'id'): string => {
  lastId += 1;
  return `${prefix}${lastId}`;
};

export const uniqueArr = <T>(arr: Array<T>): Array<T> => {
  return Array.from(new Set(arr));
};

export const checkMissingDependencies = (dependencies: Array<string>): Array<string> =>
  dependencies.filter(d => !which(d));
