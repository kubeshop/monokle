import {Tree} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const TreeContainer = styled.div`
  margin-left: 2px;
  height: 100%;
`;

export const TreeDirectoryTree = styled(Tree.DirectoryTree)<{$isHighlightSelection: boolean}>`
  margin-top: 10px;
  .ant-tree-switcher svg {
    color: ${props => (props.disabled ? `${Colors.grey800}` : 'inherit')} !important;
  }

  opacity: ${props => (props.disabled ? '70%' : '100%')};

  & .ant-tree-treenode-selected {
    vertical-align: center;
    margin-left: 0px !important;
    border-left: 8px hidden transparent;
    padding-bottom: 0px;
    background: ${props => (props.$isHighlightSelection ? Colors.highlightColor : Colors.selectionColor)} !important;
    color: ${props => (props.$isHighlightSelection ? Colors.cyan7 : Colors.blackPure)} !important;
  }
  & .ant-tree-treenode-selected::before {
    background: ${props => (props.$isHighlightSelection ? Colors.highlightColor : Colors.selectionColor)} !important;
  }
  & .ant-tree-treenode::selection {
    background: ${props => (props.$isHighlightSelection ? Colors.highlightColor : Colors.selectionColor)} !important;
  }
  & .ant-tree-node-selected {
    color: ${props => (props.$isHighlightSelection ? Colors.cyan7 : Colors.blackPure)} !important;
    font-weight: bold;
  }

  & .ant-tree-treenode::before {
    bottom: 0px !important;
  }
`;
