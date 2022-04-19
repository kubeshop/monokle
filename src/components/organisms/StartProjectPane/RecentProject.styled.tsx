import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div<{activeproject: boolean}>`
  border-left: 4px solid ${props => (props.activeproject ? Colors.lightSeaGreen : 'transparent')};
  color: ${props => (props.activeproject ? Colors.lightSeaGreen : Colors.whitePure)};
  cursor: pointer;
  position: relative;
  padding: 0.5rem 1rem;

  :hover {
    background: ${Colors.grey2000};
  }

  .anticon-pushpin {
    position: absolute;
    right: 0.3rem;
    top: 0.3rem;
    padding: 0.3rem;
  }
`;

export const Name = styled.div`
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

export const Path = styled.div`
  color: ${Colors.grey7};
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

export const LastOpened = styled.div`
  color: ${Colors.grey5};
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;
