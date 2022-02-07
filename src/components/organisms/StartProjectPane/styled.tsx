import styled from 'styled-components';

import StartBackgrojnd from '@assets/StartBackground.svg';

import Colors from '@styles/Colors';

export const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 40px;
  cursor: pointer;
`;

export const ActionText = styled.div`
  color: ${Colors.blue7};
  font-size: 0.875em;
  text-align: center;
`;

export const ActionTitle = styled.div`
  font-size: 22px;
  text-align: center;
  margin-bottom: 150px;
`;

export const Container = styled.div`
  width: 100%;
  height: calc(100vh - 112px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 150px;
`;

export const FolderAddOutlined = styled.img`
  width: 64px;
  margin-bottom: 24px;
`;

export const FolderOpenOutlined = styled.img`
  width: 64px;
  color: ${Colors.blue10};
  margin-bottom: 24px;
`;

export const FormatPainterOutlined = styled.img`
  width: 64px;
  color: ${Colors.blue10};
  margin-bottom: 24px;
`;

export const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
`;

export const StartBackground = styled(Container)`
  background: url('${StartBackgrojnd}') no-repeat;
  background-position: 55% 35%;
`;

export const StartProjectPaneContainer = styled.div`
  height: 100%;
  border-left: 1px solid ${Colors.grey3};
  display: grid;
  grid-template-rows: max-content 1fr;
`;
