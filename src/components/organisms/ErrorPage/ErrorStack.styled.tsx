import {Button} from 'antd';

import {DownOutlined as DownOutlinedBase} from '@ant-design/icons';

import {motion} from 'framer-motion';
import styled from 'styled-components';

html{
 font-size : 10px;
}

export const DownOutlined = styled(DownOutlinedBase)`
  font-size: 1rem;
`;

export const ErrorStack = styled.div`
  width: 700px;
  margin-bottom: 6px;
`;

export const ErrorButton = styled(Button)`
  width: 100%;
  text-align: center;
`;

export const ErrorStackContent = styled(motion.section)`
  height: 100%;
  overflow: auto;
`;
