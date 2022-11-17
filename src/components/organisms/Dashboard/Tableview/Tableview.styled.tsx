import {Table as RawTable} from 'antd';

import styled from 'styled-components';

export const Table = styled(RawTable)`
  .ant-table-container {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  .ant-table-header {
    background-color: #1d1d1d;
    border-radius: 4px 4px 0 0;
    .ant-table-thead {
      .ant-table-cell {
        color: #dbdbdb;
        font-size: 14px;
        font-weight: 700;
      }
    }
  }
  .ant-table-body {
    background-color: #141414;
    color: #dbdbdb;
    font-size: 14px;
    font-weight: 400;
    border-radius: 0 0 4px 4px;
  }
`;
