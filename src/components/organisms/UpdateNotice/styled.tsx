import {Button} from 'antd';

import styled from 'styled-components';

export const NewVersionText = styled.span`
  font-weight: bold;
  margin-left: 10px;
`;

export const UpdateNoticeContainer = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  background: linear-gradient(90deg, #15395b 0%, #2c2c2c 100%);
  border-radius: 4px;
  color: white;
  margin-right: 20px;
  margin-bottom: 20px;
  padding: 10px 20px;
`;

export const InstallButton = styled(Button)`
  margin-left: 10px;
`;
