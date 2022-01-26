import {Button} from 'antd';

import styled from 'styled-components';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

import Colors from '@styles/Colors';

export const TitleBarContainer = styled.div`
  display: flex;
  height: 24px;
  justify-content: space-between;
`;

export const Title = styled.span`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  padding-right: 10px;
`;

export const ProjectsContainer = styled.div`
  padding: 16px 12px;
  height: calc(100vh - 112px);
  overflow-y: scroll;
  width: 100%;
  ${GlobalScrollbarStyle}
`;

export const ProjectItem = styled.div<{activeproject: boolean}>`
  margin-bottom: 16px;
  margin-left: ${props => (props.activeproject ? '-12px' : 'unset')};
  padding-left: ${props => (props.activeproject ? '12px' : 'unset')};
  border-left: 4px solid ${props => (props.activeproject ? Colors.lightSeaGreen : 'transparent')};
  color: ${props => (props.activeproject ? Colors.lightSeaGreen : Colors.whitePure)};
`;

export const ProjectName = styled.div`
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: auto;
  max-width: 320px;

  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

export const ProjectPath = styled.div`
  color: ${Colors.grey7};
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: auto;
`;

export const ProjectLastOpened = styled.div`
  color: ${Colors.grey5};
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: auto;
`;

export const BackToProjectButton = styled(Button)`
  font-size: 12px;
  color: ${Colors.lightSeaGreen};
`;
