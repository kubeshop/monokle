import {Table as AntdTable} from 'antd';

import styled from 'styled-components';

import type {Rule} from './ValidationOpenPolicyAgentTable';

export const Table = styled(props => <AntdTable<Rule> {...props} />)`
  .ant-table-thead > tr > th {
    background-color: #191f21 !important;
  }
  .ant-table-tbody {
    color: white;
    background: #191f21 !important;
  }
  .ant-table-column-sort {
    background: #191f21;
  }
`;
