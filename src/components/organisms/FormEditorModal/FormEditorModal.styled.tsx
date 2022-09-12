import {Col} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const ContentDiv = styled.div`
  margin-right: -8px;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
`;

export const SourceNameBlock = styled.div`
  display: flex;
  padding: 14px 12px;
  border-radius: 2;
  background-color: ${Colors.greyXY};
  margin-bottom: 16px;
  font-weight: 600;
`;

export const BlockTitle = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  font-size: 16px;
  padding: 14px 12px;
  border-radius: 2;
  background-color: ${Colors.coldGrey};
  margin-bottom: 16px;
`;

export const FilePath = styled.div`
  color: ${Colors.blue9};
  font-weight: 600;
  margin-right: 10px;
  span {
    color: white;
    margin-right: 5px;
  }
`;

export const FileName = styled.div`
  color: ${Colors.blue9};
  font-weight: 400;

  span {
    color: white;
    margin-right: 5px;
  }
`;

export const StyledCol = styled(Col)`
  background: ${Colors.blackPure};
  overflow: hidden;
`;
