import {Collapse} from 'antd';

import styled from 'styled-components';

export const Panel = styled(Collapse.Panel)<{$contentHeight: number; $panelKey: string}>`
  &.ant-collapse-item-active {
    height: 100%;
  }

  .ant-collapse-content-box {
    padding: 0 !important;
    overflow-y: ${props => (props.$panelKey === 'files' ? 'hidden' : 'auto')};
    max-height: ${props => props.$contentHeight}px;
  }
`;
