import {Button} from 'antd';

import styled from 'styled-components';

import {AppBorders} from '@shared/styles/borders';

export const ActionsContainer = styled.div`
  margin-left: auto;
  display: flex;
  gap: 15px;

  .ant-badge-count {
    top: 3px;
    right: 3px;
  }
`;

export const LearnButton = styled(Button)`
  font-size: 16px;
  padding: 0px 10px;
`;

export const Logo = styled.img`
  height: 31px;
`;

export const LogoContainer = styled.div`
  border-right: ${AppBorders.sectionDivider};
  width: 50px;
`;

export const StartPageHeaderContainer = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
  gap: 20px;
`;
