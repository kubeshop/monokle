import {Button} from 'antd';

import styled from 'styled-components';

export const CloseButton = styled(Button)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 0px;
`;

export const DownloadedContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const InstallButton = styled(Button)`
  margin: 0px 25px 0px 10px;
`;

export const NewVersionText = styled.span`
  margin-left: 10px;
  font-weight: bold;
`;

export const UpdateNoticeContainer = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(90deg, #15395b 0%, #2c2c2c 100%);
  border-radius: 4px;
  color: white;
  margin-right: 20px;
  margin-bottom: 20px;
  padding: 10px 20px;
`;
