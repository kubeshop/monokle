export type AllKeysRequired<T> = {
  [K in keyof Required<T>]: T[K];
};

export type FlattenObjectKeys<T extends Record<string, unknown>, Key = keyof T> = Key extends string
  ? T[Key] extends Record<string, unknown>
    ? `${Key}.${FlattenObjectKeys<T[Key]>}`
    : `${Key}`
  : never;

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type ExtractProperties<ObjectType> = Pick<
  ObjectType,
  {
    [Property in keyof ObjectType]: ObjectType[Property] extends (...params: unknown[]) => unknown ? never : Property;
  }[keyof ObjectType]
>;
