import {Table as RawTable} from 'antd';

import {EditOutlined as RawEditOutlined} from '@ant-design/icons/lib/icons';

import styled from 'styled-components';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

import Colors from '@styles/Colors';

export const Table = styled(props => <RawTable {...props} />)`
  width: 800px;
  border-top: 1px solid ${Colors.grey3};
  ${GlobalScrollbarStyle}
`;

export const ClusterAccessContainer = styled.span`
  padding: 5px;
`;

export const NamespacesTooltipContainer = styled.div`
  padding: 5px;
  display: flex;
  flex-direction: column;
`;

export const EditOutlined = styled(RawEditOutlined)`
  color: ${Colors.blue6};
`;
