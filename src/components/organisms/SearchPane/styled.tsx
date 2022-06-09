import {Button, Skeleton as RawSkeleton, Tree} from 'antd';

import styled from 'styled-components';

import Colors, {FontColors} from '@styles/Colors';

export const NodeContainer = styled.div`
  position: relative;
`;

export const FileTreeContainer = styled.div`
  width: 100%;
  height: 100%;

  & .ant-tree {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
      'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    font-variant: tabular-nums;
    font-size: 12px;
    font-style: normal;
    font-weight: normal;
    line-height: 22px;
    color: ${FontColors.darkThemeMainFont};
  }
  & .ant-tree-list-scrollbar {
    width: 8px;
    background: ${Colors.grey1000};
    border-radius: 0;
  }

  & .ant-tree-list-scrollbar-thumb {
    background: ${Colors.grey4} !important;
    border-radius: 0 !important;
  }

  & .ant-tree-treenode {
    margin-left: 8px;
    background: transparent;
  }

  & .ant-tree-switcher-leaf-line::before {
    border-right: 1px solid #434343;
  }

  & .ant-tree-switcher-leaf-line::after {
    border-bottom: 1px solid #434343;
  }

  & .ant-tree-treenode-selected {
    vertical-align: center;
    margin-left: 0px !important;
    border-left: 8px hidden transparent;
    padding-left: 8px;
    padding-bottom: 0px;
    background: ${Colors.selectionGradient} !important;
  }
  & .ant-tree-treenode-selected::before {
    background: ${Colors.selectionGradient} !important;
  }
  & .file-entry-name {
    color: ${Colors.blue10};
  }
  & .ant-tree-treenode-selected .file-entry-name,
  & .ant-tree-treenode-selected .file-entry-path {
    color: ${Colors.blackPure} !important;
  }
  & .ant-tree-treenode-selected .ant-tree-switcher {
    color: ${Colors.blackPure} !important;
  }
  & .ant-tree-treenode-selected .file-entry-nr-of-resources {
    color: ${Colors.blackPure} !important;
  }
  & .ant-tree-treenode::selection {
    background: ${Colors.selectionGradient} !important;
  }
  & .filter-node {
    font-weight: bold;
    background: ${Colors.highlightGradient};
  }
  & .filter-node .file-entry-name {
    color: ${FontColors.resourceRowHighlight} !important;
  }
  .ant-tree.ant-tree-directory .ant-tree-treenode .ant-tree-node-content-wrapper.ant-tree-node-selected {
    color: ${Colors.blackPure} !important;
    font-weight: bold;
  }
  & .ant-tree-iconEle {
    flex-shrink: 0;
  }
  & .ant-tree-node-content-wrapper {
    display: flex;
    overflow: hidden;
  }

  & .ant-tree-node-content-wrapper .ant-tree-title {
    overflow: hidden;
    flex-grow: 1;
  }

  & .ant-tree-switcher {
    background: transparent;
  }
`;

export const Skeleton = styled(RawSkeleton)`
  margin: 20px;
  width: 90%;
`;

export const NodeTitleContainer = styled.div`
  padding-right: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RootFolderText = styled.div`
  font-size: 12px;
  color: ${Colors.grey7};
  margin: 15px 15px 0;
`;

export const MatchText = styled.div`
  color: ${Colors.lightSeaGreen};
  padding: 0 15px;
`;

export const EntryName = styled.span``;

export const MatchCount = styled.span`
  margin-left: 5px;
  font-size: 14px;
  color: ${Colors.yellow11};
`;

export const Path = styled.span`
  margin-left: 5px;
  color: ${Colors.grey7};
`;

export const MatchLine = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  em {
    background: ${Colors.yellow11};
    color: ${Colors.green10};
    font-style: normal;
  }
`;

export const TreeContainer = styled.div`
  margin-left: 2px;
`;

export const TreeDirectoryTree = styled(Tree.DirectoryTree)`
  margin-top: 10px;

  .ant-tree-treenode-switcher-open.ant-tree-treenode-leaf-last {
    display: none;
  }

  opacity: ${props => (props.disabled ? '70%' : '100%')};
`;

export const SearchBox = styled.div`
  display: flex;
  margin: 5px 14px;
`;

export const StyledButton = styled(Button)<{$isItemSelected: boolean}>`
  display: flex;
  justify-content: center;
  width: 32px;
  margin-left: 8px;
  ${({$isItemSelected}) => $isItemSelected && `background-color: ${Colors.grey6}`};

  &:hover {
    color: ${Colors.lightSeaGreen};
    ${({$isItemSelected}) => $isItemSelected && `background-color: ${Colors.grey6}`};
    ${({$isItemSelected}) => `border-color: ${$isItemSelected ? Colors.grey5b : Colors.lightSeaGreen};`}
  }

  &:focus {
    color: ${Colors.whitePure};
    ${({$isItemSelected}) => $isItemSelected && `background-color: ${Colors.grey6}`};
  }

  :nth-child(3) {
    span {
      transform: rotate(-90deg);
      position: absolute;
      top: 8px;
      left: 13px;
    }
  }
`;

export const RecentSearchTitle = styled.div`
  color: ${Colors.cyan7};
  text-transform: uppercase;
  margin: 10px 0;
`;

export const RecentSearchItem = styled.div`
  color: ${Colors.grey9};
  font-weight: 400;
  font-size: 14px;
  padding: 2px 1px;
  margin: 5px 0;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  &:hover {
    cursor: pointer;
    color: ${Colors.cyan7};
    transition: all 0.5s ease;
  }
`;
