import {Button} from 'antd';

import styled from 'styled-components';

import StartBackgrojnd from '@assets/StartBackground.svg';

import Colors from '@styles/Colors';

export const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
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

export const ActionsContainer = styled.div`
  display: flex;
  gap: 80px;
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

export const StartBackground = styled.div`
  background: url('${StartBackgrojnd}') no-repeat;
  background-position: 55% 35%;

  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 150px;
`;

export const StartProjectPaneContainer = styled.div`
  height: 100%;
  border-left: 1px solid ${Colors.grey3};
  display: grid;
  grid-template-rows: max-content 1fr;
`;

export const BackToProjectButton = styled(Button)`
  font-size: 12px;
  color: ${Colors.lightSeaGreen};
`;

export const Container = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: max-content 1fr;
`;

export const RecentProjectsPaneContainer = styled.div`
  height: 100%;
  border-left: 1px solid ${Colors.grey3};
  position: relative;

  & .custom-modal-handle {
    position: absolute;
    top: 50%;
    left: -5px;
    height: 100%;
    width: 10px;
    background-color: transparent;
    cursor: col-resize;
    transform: translateY(-50%);
  }
`;
