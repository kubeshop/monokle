import {DeleteOutlined as RawDeleteOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const ActionsContainer = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const Container = styled.div<{activeproject: boolean}>`
  border-left: 4px solid ${props => (props.activeproject ? Colors.lightSeaGreen : 'transparent')};
  color: ${props => (props.activeproject ? Colors.lightSeaGreen : Colors.whitePure)};
  cursor: pointer;
  position: relative;
  padding: 0.5rem 1rem;

  & .anticon-delete {
    display: none;
  }

  :hover {
    background: ${Colors.grey2000};

    & .anticon-delete {
      display: inline-block;
    }
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
  color: ${Colors.grey6};
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;
