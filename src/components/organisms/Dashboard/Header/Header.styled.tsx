import {Select as RawSelect} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div`
  padding: 16px 16px 0 16px;
  & > div:first-child {
    height: 100%;
    background-color: ${Colors.grey3b};
    > div:first-child {
      font-weight: 700;
      font-size: 16px;
    }
  }
`;

export const Select = styled(RawSelect)`
  .ant-select-selector {
    width: 240px !important;
    padding: 0 16px;
    .ant-select-selection-search-input,
    .ant-select-selection-placeholder {
      color: ${Colors.whitePure};
      border-color: ${Colors.grey6};
      font-weight: 400;
      font-size: 14px;
      padding-left: 16px;
      width: 180px;
    }
  }
`;
