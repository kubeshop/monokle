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
