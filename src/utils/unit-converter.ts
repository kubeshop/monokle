export const cpuParser = (input: string): number => {
  const mMatch: RegExpMatchArray | null = input.match(/^([0-9]+)m$/);
  if (mMatch) {
    return Number(mMatch[1]);
  }

  const uMatch: RegExpMatchArray | null = input.match(/^([0-9]+)u$/);
  if (uMatch) {
    return Number(uMatch[1]) / 1000;
  }

  const nMatch: RegExpMatchArray | null = input.match(/^([0-9]+)n$/);
  if (nMatch) {
    return Number(nMatch[1]) / 1000000;
  }

  return Number(input) * 1000;
};

const memoryMultipliers: {[key: string]: number} = {
  k: 1000,
  M: 1000 ** 2,
  G: 1000 ** 3,
  T: 1000 ** 4,
  P: 1000 ** 5,
  E: 1000 ** 6,
  Ki: 1024,
  Mi: 1024 ** 2,
  Gi: 1024 ** 3,
  Ti: 1024 ** 4,
  Pi: 1024 ** 5,
  Ei: 1024 ** 6,
};

export const memoryParser = (input: string) => {
  const unitMatch = input.match(/^([0-9]+)([A-Za-z]{1,2})$/);
  if (unitMatch) {
    return Number(unitMatch[1]) * memoryMultipliers[String(unitMatch[2])];
  }

  return Number(input);
};

export const convertBytesToGigabyte = (bytes: number, decimals = 2): number => {
  // eslint-disable-next-line no-implicit-coercion
  if (!+bytes) return 0;

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;

  // eslint-disable-next-line prefer-exponentiation-operator, no-restricted-properties
  return parseFloat((bytes / Math.pow(k, 3)).toFixed(dm));
};
