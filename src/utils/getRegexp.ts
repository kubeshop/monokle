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

function decorateMatch(text: string, word: string): string {
  const wordIdx = text.indexOf(word);
  const textWithHighlights = `${text.slice(0, wordIdx)}<em>${text.slice(
    wordIdx,
    wordIdx + word.length
  )}</em>${text.slice(wordIdx + word.length)}`;
  return textWithHighlights;
}

function getTextRest(text: string, word: string) {
  const wordIdx = text.indexOf(word);
  return text.slice(wordIdx + word.length);
}

export function getMatchLines(text: string, matches: RegExpMatchArray): string[] {
  const highlightedLines = matches.map(m => {
    const textWithHighlight = decorateMatch(text, m);
    text = getTextRest(text, m);
    return textWithHighlight;
  });

  return highlightedLines
    .join('')
    .split('\n')
    .filter(el => el.includes('<em>'));
}
