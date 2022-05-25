import {FileEntry} from '@models/fileentry';

import {TreeNode} from './types';

import * as S from './styled';

type Props = {
  item: FileEntry;
};

export const createFilteredNode = (filteredFileMap: FileEntry[]): TreeNode => {
  const Title = ({item}: Props) => (
    <S.NodeContainer>
      <S.NodeTitleContainer>
        <span>{item.name}</span>
        <S.MatchCount>{item.matchCount}</S.MatchCount>
        <S.Path>{item.filePath}</S.Path>
      </S.NodeTitleContainer>
    </S.NodeContainer>
  );

  return {
    key: 'filter',
    isExcluded: true,
    isSupported: true,
    isLeaf: false,
    title: <></>,
    highlight: false,
    isFolder: false,
    children: filteredFileMap.map((item: FileEntry) => ({
      ...item,
      children: [],
      highlight: false,
      isLeaf: true,
      isSupported: true,
      isExcluded: false,
      key: item.filePath,
      title: <Title item={item} />,
    })),
  };
};
