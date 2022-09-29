import Highlighter from 'react-highlight-words';

import textExtensions from 'text-extensions';

import {FileEntry, MatchNode} from '@models/fileentry';

import {FilterTreeNode} from '../FileTreePane/types';

import * as S from './styled';

export const createFilteredNode = (filteredFileMap: FileEntry[]): FilterTreeNode[] => {
  const Title = ({item}: {item: FileEntry}) => (
    <S.NodeContainer>
      <S.NodeTitleContainer>
        <S.EntryName className="file-entry-name">{item.name}</S.EntryName>
        <S.MatchCount>{item.matchCount}</S.MatchCount>
        <S.Path className="file-entry-path">{item.filePath}</S.Path>
      </S.NodeTitleContainer>
    </S.NodeContainer>
  );

  return filteredFileMap.map((item: FileEntry) => {
    const fileExtension = item.extension.split('.').join('');
    const isTextExtension = textExtensions.some(supportedExtension => supportedExtension === fileExtension);
    return {
      ...item,
      highlight: false,
      isLeaf: false,
      isFolder: false,
      isSupported: item.isSupported,
      isExcluded: item.isExcluded,
      filePath: item.filePath,
      key: item.filePath,
      isTextExtension,
      title: <Title item={item} />,
      children:
        item.matchLines?.map((line: MatchNode[], idx: number) => ({
          key: `ml_${item.filePath}_${idx}`,
          parentKey: item.filePath,
          title: (
            <Highlighter
              highlightClassName="match-highlight"
              searchWords={line[0].matchesInLine}
              autoEscape
              textToHighlight={line[0].wholeLine}
            />
          ),
          isFolder: false,
          isLine: true,
          matchItemArr: line,
        })) || [],
    };
  });
};
