import {Input, Table as RawTable, TableProps} from 'antd';

import styled from 'styled-components';

import {GitBranch} from '@models/git';

import Colors from '@styles/Colors';

export const Container = styled.div`
  background-color: ${Colors.warmGrey};
  width: 640px;
  padding: 8px;
  padding-bottom: 12px;
`;

export const TableFilter = styled.div`
  display: flex;
  align-items: center;
  height: 50px;
  background-color: ${Colors.coldGrey};
  padding-left: 12px;
  margin-bottom: 4px;
`;

export const SearchInput = styled(Input)`
  width: 260px;
  height: 32px;
`;

export const Table = styled((props: TableProps<GitBranch>) => <RawTable<GitBranch> {...props} />)`
  width: 100%;
  .ant-table-thead > tr > th {
    height: 50px;
    background-color: ${Colors.grey4} !important;
  }
  .ant-table-tbody {
    color: white;
    background: ${Colors.warmGrey} !important;
  }
`;
