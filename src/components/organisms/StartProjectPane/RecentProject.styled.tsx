import styled from 'styled-components';

import Colors from '@styles/Colors';

export const ProjectItem = styled.div<{activeproject: boolean}>`
  padding: 4px 8px 4px 8px;
  margin-left: ${props => (props.activeproject ? '-12px' : 'unset')};
  padding-left: ${props => (props.activeproject ? '12px' : 'unset')};
  border-left: 4px solid ${props => (props.activeproject ? Colors.lightSeaGreen : 'transparent')};
  color: ${props => (props.activeproject ? Colors.lightSeaGreen : Colors.whitePure)};
  cursor: pointer;
  position: relative;
  padding: 0.5rem;

  :hover {
    background: ${Colors.grey2000};
  }

  .anticon-pushpin {
    position: absolute;
    right: 0.5rem;
    top: 0.5rem;
  }
`;

export const ProjectName = styled.div`
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

export const ProjectPath = styled.div`
  color: ${Colors.grey7};
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

export const ProjectLastOpened = styled.div`
  color: ${Colors.grey5};
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;
