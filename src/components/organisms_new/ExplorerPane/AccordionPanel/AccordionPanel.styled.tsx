import {Collapse} from 'antd';

import styled from 'styled-components';

export const Panel = styled(Collapse.Panel)`
  &.ant-collapse-item-active {
    height: 100%;
  }

  .ant-collapse-content-box {
    padding: 0 !important;
    overflow-y: hidden;
    max-height: ${(props: {contentHeight: number}) => props.contentHeight}px;
  }
`;
