import {Button} from 'antd';

import styled from 'styled-components';

export const PrimaryButton = styled(Button)`
  border-radius: 4px;
  padding: 0px 14px;
  font-weight: 600;
  border: none;

  &.ant-btn-link {
    padding: 0px 6px;
  }
`;
