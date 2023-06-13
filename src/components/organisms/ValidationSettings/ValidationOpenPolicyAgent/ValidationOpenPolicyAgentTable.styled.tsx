import {Table as AntdTable, TableProps} from 'antd';

import {SearchOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import type {Rule} from '@shared/models/validation';
import {Colors} from '@shared/styles/colors';

export const Container = styled.div``;

export const InputContainer = styled.div`
  padding: 0px 16px;
`;

export const RuleId = styled.span`
  color: ${Colors.grey7};
  font-size: 12px;
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

  .ant-table-thead > tr > th:nth-child(2)::before {
    display: none;
  }

  .ant-table-thead > tr > th:nth-child(3)::before {
    display: none;
  }
`;

export const TableContainer = styled.div`
  overflow-y: auto;
  padding-top: 10px;
`;
