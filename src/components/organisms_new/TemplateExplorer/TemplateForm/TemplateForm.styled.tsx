import {Steps as RawSteps} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles';

export const FormContainer = styled.div`
  margin-top: 30px;
  overflow-x: hidden;
  overflow-y: auto;
  padding-right: 10px;
`;

export const Steps = styled(RawSteps)<{$width: number; $count: number}>`
  max-width: ${({$width}) => $width}px;
  overflow-x: auto;
  display: grid;
  grid-template-columns: ${({$count}) => `repeat(${$count - 1}, minmax(min-content, 1fr)) min-content`};
  padding-bottom: 6px;
  min-height: 60px;

  .ant-steps-item-description {
    max-width: 150px !important;
    overflow: hidden;
    white-space: nowrap !important;
    text-overflow: ellipsis;
  }

  .ant-steps-item-process .ant-steps-item-icon {
    background: #5273e0;
    border: none;

    & > .ant-steps-icon {
      color: ${Colors.grey1};
    }
  }

  .ant-steps-item-wait .ant-steps-item-icon {
    background-color: #2d3757;
    border: none;

    & > .ant-steps-icon {
      color: ${Colors.grey7};
    }
  }
`;
