import {Table as RawTable} from 'antd';

import {EditOutlined as RawEditOutlined} from '@ant-design/icons/lib/icons';

import styled from 'styled-components';

import Colors, {BackgroundColors} from '@styles/Colors';

export const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

export const ClusterAccessContainer = styled.span`
  padding: 5px;
`;

export const ClusterColor = styled.div`
  background-color: ${BackgroundColors.clusterModeBackground};
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid ${Colors.blue6};
`;

export const EditOutlined = styled(RawEditOutlined)`
  color: ${Colors.blue6};
`;

export const NamespacesTooltipContainer = styled.div`
  padding: 5px;
  display: flex;
  flex-direction: column;
`;

export const Table = styled(props => <RawTable {...props} />)`
  width: 840px;
  border-top: 1px solid ${Colors.grey3};

  tbody {
    vertical-align: top;
  }

  & .ant-table-container .ant-table-body {
    overflow-y: auto !important;
  }
`;
