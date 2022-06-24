import {useMemo} from 'react';

import * as S from './styled';

type RecentSearchProps = {
  handleClick: (query: string) => void;
  recentSearch: string[];
};

const RecentSearch = ({handleClick, recentSearch}: RecentSearchProps) => {
  const recentSearchItems = useMemo(() => [...recentSearch].reverse(), [recentSearch]);

  return (
    <>
      <S.RecentSearchTitle>Recent Searches</S.RecentSearchTitle>
      {recentSearchItems.map((searchQuery: string) => (
        <S.RecentSearchItem key={searchQuery} onClick={() => handleClick(searchQuery)}>
          {searchQuery}
        </S.RecentSearchItem>
      ))}
    </>
  );
};

export default RecentSearch;
