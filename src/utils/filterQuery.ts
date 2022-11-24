import {MatchParamProps} from '@shared/models/appState';
import {FileEntry} from '@shared/models/fileEntry';

/* based on matching params we change the way we find matches in file */
export function getRegexp(query: string, params: MatchParamProps): RegExp {
  let matchParams = 'gi'; // global, case insensitive by default
  if (params.matchCase) {
    // @param matchCase: respect the casing if true
    matchParams = 'g';
  }
  if (!params.regExp) {
    query = query.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
  }

  let queryRegExp = new RegExp(query, matchParams);

  if (params.matchWholeWord) {
    // @param matchWholeWord: find a match only if it is a standalone word, not a substring
    queryRegExp = new RegExp(`\\b${query}\\b`, matchParams);
  }
  if (params.regExp) {
    // if the query is a regular expression
    queryRegExp = new RegExp(query, matchParams);
  }

  return queryRegExp;
}

function getMatchIndexes(text: string, query: string, fromIndex = 0): {start: number; end: number} {
  const textToSearch = text.slice(fromIndex);
  const queryIdx = textToSearch.slice(0).indexOf(query);
  return {start: fromIndex + queryIdx, end: fromIndex + queryIdx + query.length};
}

function getMatchLines(text: string, queryRegExp: RegExp, searchCounterRef: any) {
  const lineArr = text.split('\n');

  const fileLineData = lineArr
    .map((line: string, index: number) => {
      const matchesInLine: RegExpMatchArray | null = line.match(queryRegExp);

      if (!matchesInLine) return null;

      return matchesInLine?.reduce((acc: any, currQuery, matchIdx) => {
        const {start, end} = getMatchIndexes(line, currQuery, (acc.length && acc[acc.length - 1].end) || 0);
        searchCounterRef.current.totalMatchCount += matchIdx + 1;
        return [
          ...acc,
          {
            matchesInLine: [currQuery],
            wholeLine: line,
            lineNumber: index + 1,
            start: start + 1,
            end: end + 1,
            currentMatchNumber: searchCounterRef.current.totalMatchCount,
          },
        ];
      }, []);
    })
    .filter(el => el);

  return fileLineData;
}

export const filterFilesByQuery = (node: FileEntry, queryRegExp: RegExp, searchCounterRef: any): FileEntry | null => {
  if (node.text && node.isSupported && !node.isExcluded) {
    const matches = node.text.match(queryRegExp);
    const matchCount = matches?.length;
    if (matchCount) {
      const matchLines = getMatchLines(node.text, queryRegExp, searchCounterRef);

      searchCounterRef.current = {
        ...searchCounterRef.current,
        filesCount: searchCounterRef.current.filesCount + 1,
      };

      return {
        ...node,
        matchCount,
        matchLines,
      };
    }
    return null;
  }

  return null;
};

export function notEmpty<FileEntry>(value: FileEntry | null | undefined): value is FileEntry {
  return value !== null && value !== undefined;
}
