import {Button as RawButton, Typography} from 'antd';

import styled from 'styled-components';

export const Button = styled(RawButton)`
  display: inline-block;
  margin-right: 24px;
  margin-bottom: 24px;
  z-index: 100;
`;

export const Container = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const ContentContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  padding: 12px 24px;

  img {
    padding: 30px 0;
    display: block;
    margin: 0 auto;
  }
`;

export const HeightFill = styled.div`
  display: block;
  height: 440px;
`;

export const TextHeader = styled(Typography.Text)`
  font-size: 16px;
`;

export const TextBlock = styled.table`
  display: block;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  overflow: hidden;
  .ant-typography {
    display: block;
  }
`;
