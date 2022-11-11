import {Checkbox, Input, Select} from 'antd';

import styled from 'styled-components';

import {Colors} from '@monokle-desktop/shared/styles/Colors';

export const FileCategoryLabel = styled.div`
  color: ${Colors.grey7};
  margin-bottom: 6px;
  margin-top: 16px;
`;

export const FileNameLabel = styled.div`
  color: ${Colors.greenOkay};
`;

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
  overflow-x: hidden;
`;
