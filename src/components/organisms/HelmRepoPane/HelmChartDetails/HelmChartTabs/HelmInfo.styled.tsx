import {Typography} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
`;

export const Header = styled.div`
  display: flex;
  gap: 20px;
`;

export const Logo = styled.img`
  width: 100px;
  height: 100px;
  object-fit: contain;
  object-position: center;
`;

export const Label = styled(Typography.Text)`
  color: ${Colors.grey8};
`;

export const ChartInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Content = styled.div`
  overflow: auto;
  min-height: 0;
  max-height: calc(100vh - 292px);
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  gap: 4px;
`;

export const Heading = styled(Typography.Text)`
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
`;

export const Description = styled(Typography.Text)`
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
`;
