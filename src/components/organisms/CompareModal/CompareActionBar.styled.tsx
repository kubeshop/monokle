import {SearchOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const ActionBarDiv = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 12px;
  margin-bottom: 6px;
  border-radius: 2px;
  background-color: ${Colors.greyXY};
  color: ${Colors.grey6};
`;

export const ActionBarRightDiv = styled.div`
  display: flex;
  align-items: center;
`;

export const SearchIcon = styled(SearchOutlined)`
  color: ${Colors.grey7};
`;
