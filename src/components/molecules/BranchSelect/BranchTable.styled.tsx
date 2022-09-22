import {Input, Button as RawButton, Select as RawSelect, Table as RawTable, TableProps} from 'antd';

import {rgba} from 'polished';
import styled from 'styled-components';

import {GitBranch} from '@models/git';

import Colors from '@styles/Colors';

export const Container = styled.div`
  background-color: ${Colors.warmGrey};
  width: 640px;
  padding: 8px;
  padding-bottom: 12px;
`;

export const CreateBranchButton = styled(RawButton)`
  margin-top: 8px;
`;

export const SearchInput = styled(Input)`
  width: 260px;
  height: 32px;
  border: 1px solid ${Colors.grey6};
`;

export const Select = styled(RawSelect)`
  width: 180px;

  .ant-select-selector {
    border: 1px solid ${Colors.grey6} !important;
  }
`;

export const Table = styled((props: TableProps<GitBranch>) => <RawTable<GitBranch> {...props} />)`
  width: 100%;

  .ant-table-container {
    background: ${Colors.warmGrey};
  }

  .ant-table-body {
    margin-top: 8px;
    overflow-y: auto !important;

    & .ant-table-row .ant-table-cell {
      border-bottom: 1px solid #303030 !important;
    }
  }

  .ant-table-thead > tr > th {
    height: 50px;
    background-color: ${Colors.grey4} !important;
  }

  .ant-table-tbody {
    color: white;
    background: ${Colors.warmGrey} !important;
    overflow-y: hidden;
  }

  .ant-table-header {
    margin-bottom: 0px;
  }

  .ant-table-header .ant-table-thead .ant-table-cell:first-child {
    border-left: none !important;
  }

  .ant-table-cell:hover .anticon-delete {
    display: block;
  }
`;

export const TableFilter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 50px;
  background-color: ${rgba(Colors.coldGrey, 0.5)};
  padding: 12px;
  margin-bottom: 8px;
`;
