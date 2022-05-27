import electronStore from '@utils/electronStore';

import * as S from './styled';

type RecentSearchProps = {
  handleClick: (query: string) => void;
};

const RecentSearch = ({handleClick}: RecentSearchProps) => {
  const recentSearch: string[] = electronStore.get('appConfig.recentSearch')?.reverse() || [];
  return (
    <>
      <S.RecentSearchTitle>Recent Searches</S.RecentSearchTitle>
      {recentSearch.map((searchQuery: string) => (
        <S.RecentSearchItem key={searchQuery} onClick={() => handleClick(searchQuery)}>
          {searchQuery}
        </S.RecentSearchItem>
      ))}
    </>
  );
};

export default RecentSearch;
