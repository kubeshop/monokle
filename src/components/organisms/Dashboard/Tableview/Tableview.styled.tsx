import {Button as RawButton, Input as RawInput, Table as RawTable} from 'antd';

import {SearchOutlined as RawSearchOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div`
  padding: 8px 16px 0px 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

export const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  grid-area: filter;
`;

export const Input = styled(RawInput)`
  background: #141414;
  width: 360px;
`;

export const TableContainer = styled.div`
  position: relative;
  height: 100%;
`;

export const Table = styled(RawTable)`
  grid-area: table;

  & .ant-table-container {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    border: 1px solid ${Colors.grey4};
  }

  & .ant-table-header {
    background-color: ${Colors.grey6000};
    border-radius: 4px 4px 0 0;
    margin: 0;
    .ant-table-thead {
      .ant-table-cell {
        color: ${Colors.grey9};
        font-size: 14px;
        font-weight: 700;
      }
    }
  }
  & .ant-table-body {
    background-color: #141414;
    color: ${Colors.grey9};
    font-size: 14px;
    font-weight: 400;
    border-radius: 0 0 4px 4px;

    .ant-table-row {
      border-top: 1px solid ${Colors.grey4};
      height: 54px;

      :hover {
        background-color: ${Colors.grey6000};
      }

      &.selected {
        background-color: ${Colors.grey6000};
      }
    }
  }
`;

export const BulkAction = styled(RawButton)``;
export const SearchOutlined = styled(RawSearchOutlined)``;
