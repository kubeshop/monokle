import {DeleteOutlined as RawDeleteOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const ActionsContainer = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

export const Container = styled.div<{activeproject: boolean}>`
  border-left: 4px solid ${props => (props.activeproject ? Colors.lightSeaGreen : 'transparent')};
  color: ${props => (props.activeproject ? Colors.lightSeaGreen : Colors.whitePure)};
  cursor: pointer;
  position: relative;
  padding: 0.5rem 1rem;

  :hover {
    background: ${Colors.grey2000};
  }
`;

export const DeleteOutlined = styled(RawDeleteOutlined)`
  color: ${Colors.red7};
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
