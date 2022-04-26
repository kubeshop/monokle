import {monaco} from 'react-monaco-editor';

interface RangeAndValue {
  range: monaco.Range;
  value: string;
}

export const getObjectKeys = (obj: any, prefix = ''): string[] =>
  Object.keys(obj).reduce((res: any, el) => {
    if (Array.isArray(obj[el])) {
      return res;
    }
    if (typeof obj[el] === 'object' && obj[el] !== null) {
      return [...res, ...getObjectKeys(obj[el], `${prefix + el}.`)];
    }
    return [...res, prefix + el];
  }, []);

export const getHelmValueRanges = (code: string | undefined): RangeAndValue[] => {
  const ranges: RangeAndValue[] = [];
  if (!code) {
    return ranges;
  }

  const valuesMatches = code?.matchAll(/{{\s.Value.+?(?=}})/g);
  if (!valuesMatches) {
    return ranges;
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const matchValue of valuesMatches) {
    const matchedValue = matchValue[0];
    if (!matchValue.input || !matchValue.index) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const lines = matchValue.input.split('\n');
    const lineNumber = code?.substring(0, matchValue.index).match(/\n/g)?.length as number;
    if (!lineNumber) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const line = lines[lineNumber];
    const start = line.split(matchedValue);

    const range = new monaco.Range(
      lineNumber + 1,
      start[0].length + 1,
      lineNumber + 1,
      start[0].length + matchedValue.length + 3
    );
    ranges.push({
      range,
      value: matchedValue.substring(3, matchedValue.length - 1),
    });
  }

  return ranges;
};
