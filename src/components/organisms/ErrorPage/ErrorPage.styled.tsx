import {Button} from 'antd';

import {DownOutlined as DownOutlinedBase} from '@ant-design/icons';

import {motion} from 'framer-motion';
import styled from 'styled-components';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

import Colors from '@styles/Colors';

export const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;
`;

export const Figure = styled.img`
  width: 16rem;
  height: 16rem;
`;

export const Heading = styled.h1`
  color: ${Colors.red7};
  font-weight: 600;
  font-size: 32px;
  line-height: 39px;
`;

export const Description = styled.p`
  margin-bottom: 0px;
`;

export const DownOutlined = styled(DownOutlinedBase)`
  font-size: 10px;
`;

export const ErrorStack = styled.div`
  margin-bottom: 6px;
`;

export const ErrorButton = styled(Button)`
  width: 100%;
  text-align: center;
`;

export const ErrorStackContent = styled(motion.section)`
  height: 100%;
  overflow-y: auto;
  ${GlobalScrollbarStyle}
`;
