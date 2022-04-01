let lastId: number = 0;

export const generateId = (prefix: string = 'id'): string => {
  lastId += 1;
  return `${prefix}${lastId}`;
};

export const uniqueArr = <T>(arr: Array<T>): Array<T> => {
  return Array.from(new Set(arr));
};

// eslint-disable-next-line no-promise-executor-return
export const sleep = (ms: number) => new Promise(res => setTimeout(() => res(null), ms));
