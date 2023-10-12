import {Tree} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const TreeContainer = styled.div`
  margin-left: 2px;
  height: 100%;
`;

export const TreeDirectoryTree = styled(Tree.DirectoryTree)<{$isHighlightSelection: boolean}>`
  margin-top: 10px;
  opacity: ${props => (props.disabled ? '70%' : '100%')};

  .ant-tree-switcher svg {
    color: ${props => (props.disabled ? `${Colors.grey800}` : 'inherit')} !important;
  }

  .ant-tree-treenode {
    padding: 0px 12px 1px 12px;

    &::before {
      bottom: 0px !important;
    }

    &::selection {
      background: ${props => (props.$isHighlightSelection ? Colors.highlightColor : Colors.selectionColor)} !important;
    }

    &-selected {
      vertical-align: center;
      margin-left: 0px !important;
      border-left: 8px hidden transparent;
      padding-bottom: 0px;
      background: ${props => (props.$isHighlightSelection ? Colors.highlightColor : Colors.selectionColor)} !important;
      color: ${props => (props.$isHighlightSelection ? Colors.cyan7 : Colors.blackPure)} !important;

      &::before {
        background: ${props =>
          props.$isHighlightSelection ? Colors.highlightColor : Colors.selectionColor} !important;
      }
    }
  }

  & .ant-tree-node-selected {
    color: ${props => (props.$isHighlightSelection ? Colors.cyan7 : Colors.blackPure)} !important;
    font-weight: bold;
  }
`;
