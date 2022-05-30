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
