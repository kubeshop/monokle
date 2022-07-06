export const pickPartialRecord = (record: Record<string, any>, keys: string[]) => {
  return Object.entries(record)
    .filter(([key]) => keys.includes(key))
    .reduce<Record<string, any>>((acc, [k, v]) => {
      acc[k] = v;
      return acc;
    }, {});
};
