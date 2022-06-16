import {Table as AntdTable, TableProps} from 'antd';

import {SearchOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

import type {Rule} from './ValidationOpenPolicyAgentTable';

export const Container = styled.div``;

export const InputContainer = styled.div`
  padding: 0px 16px;
`;

export const SearchIcon = styled(SearchOutlined)`
  color: ${Colors.grey7};
`;

export const Table = styled((props: TableProps<Rule>) => <AntdTable<Rule> {...props} />)`
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

  .ant-table-thead > tr > th:nth-child(3)::before {
    display: none;
  }
`;

export const TableContainer = styled.div<{$height: number}>`
  ${({$height}) => `
    height: ${$height}px;
`}
  overflow-y: auto;
  margin-top: 10px;
`;
