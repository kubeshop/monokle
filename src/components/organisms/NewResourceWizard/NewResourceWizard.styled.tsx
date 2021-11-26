import {Checkbox, Select} from 'antd';

import styled from 'styled-components';

export const StyledCheckbox = styled(Checkbox)`
  .ant-checkbox + span {
    white-space: nowrap;
  }
`;

export const SaveToFolderWrapper = styled.div`
  display: flex;
  align-items: center;
`;

// Comment the width and check the behavior. Maybe you can find other solution without this width: 1px
export const StyledSelect = styled(Select)`
  flex: 1;
  width: 1px;
`;
