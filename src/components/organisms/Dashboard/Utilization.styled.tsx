import {Progress as RawProgress} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div`
  height: 100%;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export const Utilization = styled.div`
  height: 100%;
  display: flex;
  flex: 1;
  align-items: center;
`;

export const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  margin: 0 -35px;
`;

export const Progress = styled(RawProgress)`
  transform: rotate(270deg);
  width: 120px;

  .ant-progress-inner {
    border-radius: 4px;
    .ant-progress-bg {
      border-radius: 4px;
    }
  }
`;

export const InformationContainer = styled.div`
  height: 100%;
  display: flex;
  margin-bottom: 50px;
  flex-direction: column;
  justify-content: end;
`;

export const InfoTitle = styled.h3`
  font-weight: 600;
  font-size: 16px;
  color: ${Colors.geekblue7};
  margin: 0;
`;

export const InfoDescription = styled.h3`
  font-weight: 600;
  font-size: 14px;
  color: ${Colors.grey9};
`;
