import {ExclamationCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

const GuideContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 10px 0;
`;

const GuideItem = styled.span`
  margin: 0 0.6rem;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: ${Colors.blue7};
  :hover {
    text-decoration: underline;
  }
`;

const Guide = () => {
  return (
    <GuideContainer>
      <ExclamationCircleOutlined />
      <GuideItem>Read a quick start guide</GuideItem>
      <GuideItem>Watch a 3-minute video tutorial</GuideItem>
      <GuideItem>Documentation</GuideItem>
    </GuideContainer>
  );
};

export default Guide;
