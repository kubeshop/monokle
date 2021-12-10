import {Checkbox, Input, Select} from 'antd';

import styled from 'styled-components';

export const StyledCheckbox = styled(Checkbox)`
  .ant-checkbox + span {
    white-space: nowrap;
  }
`;

export const SaveDestinationWrapper = styled(Input.Group)`
  display: flex !important;
  margin-top: 16px;
`;

// Comment the width and check the behavior. Maybe you can find other solution without this width: 1px
export const StyledSelect = styled(Select)`
  flex: 1;
  overflow: hidden;
`;
