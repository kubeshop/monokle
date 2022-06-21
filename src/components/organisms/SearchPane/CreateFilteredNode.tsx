import parse from 'html-react-parser';

import {FileEntry, MatchNode} from '@models/fileentry';

import {FilterTreeNode} from '../FileTreePane/types';

import * as S from './styled';

type Props = {
  item: FileEntry;
};

type MatchLineProps = {
  lineMatches: MatchNode[];
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

  const StyledMatchLine = ({lineMatches}: MatchLineProps) => {
    const wholeLine = lineMatches.reduce((acc: string, lm: MatchNode) => acc + lm.textWithHighlights, '');
    return <S.MatchLine>{parse(wholeLine)}</S.MatchLine>;
  };

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
        item.matchLines?.map((lineMatches, idx) => ({
          key: `ml_${item.filePath}_${idx}`,
          parentKey: item.filePath,
          title: <StyledMatchLine lineMatches={lineMatches} />,
          isFolder: false,
          isLeaf: true,
          matchItem: lineMatches[0],
        })) || [],
    })),
  };
};
