import parse from 'html-react-parser';

import {FileEntry} from '@models/fileentry';

import {FilterTreeNode} from '../FileTreePane/types';

import * as S from './styled';

type Props = {
  item: FileEntry;
};

export const createFilteredNode = (filteredFileMap: FileEntry[]): FilterTreeNode => {
  const Title = ({item}: Props) => (
    <S.NodeContainer>
      <S.NodeTitleContainer>
        <S.EntryName className="file-entry-name">{item.name}</S.EntryName>
        <S.MatchCount>{item.matchCount}</S.MatchCount>
        <S.Path className="file-entry-path">{item.filePath}</S.Path>
      </S.NodeTitleContainer>
    </S.NodeContainer>
  );

  const StyledMatchLine = ({line}: {line: string}) => <S.MatchLine>{parse(line)}</S.MatchLine>;

  return {
    key: 'filter',
    isExcluded: true,
    isSupported: true,
    isLeaf: false,
    title: <></>,
    highlight: false,
    isFolder: true,
    children: filteredFileMap.map((item: FileEntry) => ({
      ...item,
      highlight: false,
      isLeaf: false,
      isFolder: false,
      isSupported: item.isSupported,
      isExcluded: item.isExcluded,
      key: item.filePath,
      title: <Title item={item} />,
      children:
        item.matchLines?.map((line, idx) => ({
          key: `ml_${item.filePath}_${idx}`,
          parentKey: item.filePath,
          title: <StyledMatchLine line={line} />,
          isFolder: false,
          isLeaf: true,
        })) || [],
    })),
  };
};
