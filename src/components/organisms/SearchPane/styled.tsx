import {Button, Skeleton as RawSkeleton, Tabs as RawTabs, Tree} from 'antd';

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

  .ant-tree-indent {
    display: none;
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
    background: ${Colors.selectionColor} !important;
  }
  & .ant-tree-treenode-selected::before {
    background: ${Colors.selectionColor} !important;
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
    background: ${Colors.selectionColor} !important;
  }
  & .filter-node {
    font-weight: bold;
    background: ${Colors.highlightColor};
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
  margin: 0 15px 0 0;

  p {
    color: ${Colors.lightSeaGreen};
    margin: 0;
  }
  span {
    color: ${Colors.grey7};
  }
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
`;

export const TreeContainer = styled.div`
  margin: 14px 0 0 2px;
`;

export const TreeDirectoryTree = styled(Tree.DirectoryTree)`
  .match-highlight {
    background: ${Colors.yellow11};
    color: ${Colors.green10};
    font-style: normal;
  }
  margin-top: 10px;

  /* hide root node */
  .ant-tree-treenode:first-of-type {
    display: none;
  }

  opacity: ${props => (props.disabled ? '70%' : '100%')};
`;

export const Form = styled.div`
  margin: 5px 14px;
`;

export const SearchBox = styled.div`
  display: flex;
  margin: 12px 0;
`;

export const StyledButton = styled(Button)<{$isItemSelected: boolean}>`
  display: flex;
  justify-content: center;
  width: 32px;
  margin-left: 8px;
  ${({$isItemSelected}) => `background-color: ${$isItemSelected ? Colors.blue6 : Colors.grey6};`}

  &:hover {
    color: ${Colors.whitePure};
    ${({$isItemSelected}) => `background-color: ${$isItemSelected ? Colors.blue6 : Colors.grey6};`};
    ${({$isItemSelected}) => `border-color: ${$isItemSelected ? Colors.grey5b : Colors.lightSeaGreen};`}
  }

  &:focus {
    color: ${Colors.whitePure};
    ${({$isItemSelected}) => `background-color: ${$isItemSelected ? Colors.blue6 : Colors.grey6};`};
    border-color: none;
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
  width: max-content;
  &:hover {
    cursor: pointer;
    color: ${Colors.cyan7};
    transition: all 0.5s ease;
  }
`;

export const Tabs = styled(RawTabs)`
  width: 100%;
  height: 100%;
  overflow: visible;

  & .ant-tabs-nav {
    padding: 0 16px;
    margin-bottom: 0px;
  }

  & .ant-tabs-nav::before {
    border-bottom: 1px solid #363636;
  }

  & .ant-tabs-content {
    height: 100%;
  }
`;

export const Label = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${Colors.grey9};
  margin-bottom: 5px;
`;

export const ResultContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 25px 0;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;

  button {
    margin-left: 10px;
  }
`;
