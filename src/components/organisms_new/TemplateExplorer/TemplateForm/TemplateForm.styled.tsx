import {Steps as RawSteps} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles';

export const FormContainer = styled.div`
  margin-top: 30px;
`;

export const Steps = styled(RawSteps)`
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
