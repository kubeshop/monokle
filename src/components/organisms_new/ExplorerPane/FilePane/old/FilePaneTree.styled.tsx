import {Tree} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const TreeContainer = styled.div`
  margin-left: 2px;
  height: 100%;
`;

export const TreeDirectoryTree = styled(Tree.DirectoryTree)`
  margin-top: 10px;
  .ant-tree-switcher svg {
    color: ${props => (props.disabled ? `${Colors.grey800}` : 'inherit')} !important;
  }

  opacity: ${props => (props.disabled ? '70%' : '100%')};
`;
