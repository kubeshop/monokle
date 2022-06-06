import {FileEntry} from '@models/fileentry';

import {TreeNode} from '../FileTreePane/types';

import * as S from './styled';

type Props = {
  item: FileEntry;
};

export const createFilteredNode = (filteredFileMap: FileEntry[]): TreeNode => {
  const Title = ({item}: Props) => (
    <S.NodeContainer>
      <S.NodeTitleContainer>
        <span className="file-entry-name">{item.name}</span>
        <S.MatchCount>{item.matchCount}</S.MatchCount>
        <S.Path className="file-entry-path">{item.filePath}</S.Path>
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
      isFolder: false,
      isSupported: item.isSupported,
      isExcluded: item.isExcluded,
      key: item.filePath,
      title: <Title item={item} />,
    })),
  };
};
