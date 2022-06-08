import {RightOutlined} from '@ant-design/icons';

import parse from 'html-react-parser';

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
        <RightOutlined />
        <S.EntryName className="file-entry-name">{item.name}</S.EntryName>
        <S.MatchCount>{item.matchCount}</S.MatchCount>
        <S.Path className="file-entry-path">{item.filePath}</S.Path>
      </S.NodeTitleContainer>
    </S.NodeContainer>
  );

  const MatchLine = ({line}: {line: string}) => <S.MatchLine>{parse(line)}</S.MatchLine>;

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
      children:
        (item.matchLines?.map(line => ({
          title: <MatchLine line={line} />,
          highlight: false,
          isLeaf: true,
          isFolder: false,
          isSupported: true,
          isExcluded: false,
        })) as TreeNode[]) || [],
      highlight: false,
      isLeaf: false,
      isFolder: false,
      isSupported: item.isSupported,
      isExcluded: item.isExcluded,
      key: item.filePath,
      title: <Title item={item} />,
    })),
  };
};
