import {FileEntry} from '@models/fileentry';

export type MatchParamProps = {
  matchCase: boolean;
  matchWholeWord: boolean;
  regExp: boolean;
};

export function getRegexp(query: string, params: MatchParamProps): RegExp {
  let matchParams = 'gi'; // global, case insensitive by default
  if (params.matchCase) {
    matchParams = 'g';
  }
  if (!params.regExp) {
    query = query.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
  }

  let queryRegExp = new RegExp(query, matchParams);

  if (params.matchWholeWord) {
    queryRegExp = new RegExp(`\\b${query}\\b`, matchParams);
  }
  if (params.regExp) {
    queryRegExp = new RegExp(query, matchParams);
  }

  return queryRegExp;
}

type Props = {
  textWithHighlights: string;
  indexStart: number;
  indexEnd: number;
};

function decorateMatch(text: string, query: string, fromIndex = 0): Props {
  const textToSearch = text.slice(fromIndex);

  const queryIdx = textToSearch.slice(0).indexOf(query);
  const textWithHighlights = `${textToSearch.slice(0, queryIdx)}<em>${textToSearch.slice(
    queryIdx,
    queryIdx + query.length
  )}</em>${textToSearch.slice(queryIdx + query.length)}`;

  return {textWithHighlights, indexStart: fromIndex + queryIdx, indexEnd: fromIndex + queryIdx + query.length};
}

function getMatchLines(text: string, queryRegExp: RegExp) {
  const lineArr = text.split('\n');

  const fileLineData = lineArr
    .map((line: string, index: number) => {
      const matchesInLine = line.match(queryRegExp);
      if (!matchesInLine) return null;

      return matchesInLine?.reduce((acc: any, currQuery) => {
        const {textWithHighlights, indexStart, indexEnd} = decorateMatch(
          line,
          currQuery,
          (acc.length && acc[acc.length - 1].end) || 0
        );
        return [
          ...acc,
          {
            textWithHighlights,
            lineNumber: index + 1,
            start: indexStart + 1,
            end: indexEnd + 1,
          },
        ];
      }, []);
    })
    .filter(el => el);

  return fileLineData;
}

export const filterFilesByQuery = (node: FileEntry, queryRegExp: RegExp, searchCounterRef: any) => {
  if (node.text && node.isSupported && !node.isExcluded) {
    const matches = node.text.match(queryRegExp);
    const matchCount = matches?.length;
    if (matchCount) {
      const matchLines = getMatchLines(node.text, queryRegExp);

      searchCounterRef.current = {
        filesCount: searchCounterRef.current.filesCount + 1,
        totalMatchCount: searchCounterRef.current.totalMatchCount + matchCount,
      };

      return {
        ...node,
        matches,
        matchCount,
        matchLines,
      };
    }

    return null as unknown as FileEntry;
  }

  return null as unknown as FileEntry;
};
