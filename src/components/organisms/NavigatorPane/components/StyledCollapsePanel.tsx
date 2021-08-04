import {Collapse} from 'antd';
import styled from 'styled-components';

const StyledCollapsePanel = styled(Collapse.Panel)`
  width: 100%;
  .ant-collapse-content-box {
    padding: 0 !important;
  }
`;

export default StyledCollapsePanel;
