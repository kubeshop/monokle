import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const CommitDate = styled.span`
  font-size: 12px;
  color: ${Colors.grey7};
  margin-right: 10px;
`;

export const CommitHash = styled.span`
  color: ${Colors.grey7};
  margin-left: 10px;
`;

export const SelectColor = styled.div<{$isMainSelector?: boolean}>`
  ${({$isMainSelector}) => {
    if ($isMainSelector) {
      return `
        .ant-select-selection-placeholder {
        color: white;
        font-size: 14px;
        font-weight: 300;
        }

        .ant-select-selection-item {
          font-size: 14px;
          font-weight: 600;
          color: ${Colors.whitePure};
        }
    `;
    }
  }}

  .ant-select-selector {
    border: 1px solid ${Colors.grey6} !important;
  }

  .ant-select-selection-item {
    color: ${Colors.whitePure};
  }
`;
