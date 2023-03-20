export type AllKeysRequired<T> = {
  [K in keyof Required<T>]: T[K];
};
