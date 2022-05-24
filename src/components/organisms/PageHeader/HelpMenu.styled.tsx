import {Menu as RawMenu} from 'antd';

import {QuestionCircleOutlined as RawQuestionCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {FontColors} from '@styles/Colors';

export const IconContainerSpan = styled.span`
  width: 18px;
  height: 18px;
  color: ${FontColors.elementSelectTitle};
  font-size: 18px;
  cursor: pointer;
`;

export const Menu = styled(RawMenu)`
  width: 200px;
`;

export const QuestionCircleOutlined = styled(RawQuestionCircleOutlined)`
  cursor: pointer;
  font-size: 20px;
  color: ${FontColors.elementSelectTitle};
`;
