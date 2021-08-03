import {Collapse} from 'antd';
import styled from 'styled-components';
import Colors from '@styles/Colors';

const StyledCollapse = styled(Collapse)`
  width: 100%;
  .ant-collapse-header {
    padding: 0 !important;
    cursor: default !important;
  }
  .ant-collapse-header:hover {
    background: ${Colors.blackPearl};
  }
`;

export const StyledCollapsePanel = styled(Collapse.Panel)`
  width: 100%;
  .ant-collapse-content-box {
    padding: 0 !important;
  }
`;

export default StyledCollapse;
