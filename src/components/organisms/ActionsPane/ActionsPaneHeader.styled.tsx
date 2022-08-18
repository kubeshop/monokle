import {Button} from 'antd';

import styled from 'styled-components';

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-left: 8px;

  Button {
    margin: 0 4px;
  }
`;

export const LeftArrowButton = styled(Button)`
  margin-right: 5px;
`;

export const RightArrowButton = styled(Button)`
  margin-right: 10px;
`;

export const SaveButton = styled(Button)`
  margin-right: 8px;
`;
