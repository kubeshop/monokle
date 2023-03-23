import {Badge as AntBadge, Button} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const FilterActionButton = styled(Button)`
  color: ${Colors.cyan8};
  padding: 0 !important;
  margin-right: 18px;
  &:hover {
    background-color: unset;
  }
`;

export const Container = styled.div`
  & > div {
    padding: 0 16px 0 20px !important;
  }
`;

export const Badge = styled(AntBadge)`
  .ant-badge-count-sm {
    font-size: 8px;
    line-height: 12px;
    color: ${Colors.grey2};
    background-color: ${Colors.greenOkay};
    border: unset;
    height: 12px;
    min-width: 12px;
    border-radius: 6px;
    box-shadow: none;
  }
`;

export const TreeSelectContainer = styled.div`
  width: 100%;

  & .ant-select {
    width: 100%;
  }

  & .ant-select-clear {
    border-radius: 50%;
  }
`;
