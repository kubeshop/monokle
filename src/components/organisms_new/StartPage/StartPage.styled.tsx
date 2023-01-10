import {SendOutlined as RawSendOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@shared/styles';

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  overflow-y: auto;
`;

export const ContentTitle = styled.div`
  font-weight: 700;
  font-size: 28px;
  color: ${Colors.whitePure};
`;

export const MainContainer = styled.div`
  display: grid;
  grid-template-columns: 190px 1fr 190px;
  grid-column-gap: 50px;
  overflow: hidden;
  height: 100%;
`;

export const Menu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 10px;
`;

export const MenuOption = styled.div<{$active: boolean}>`
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 16px;
  cursor: pointer;
  color: ${({$active}) => ($active ? Colors.geekblue9 : Colors.grey9)};
  font-weight: ${({$active}) => ($active ? '700' : '400')};
  transition: all 0.2s ease-in;

  & button {
    color: ${({$active}) => ($active ? Colors.geekblue9 : Colors.grey9)};
  }

  &:hover,
  &:hover button {
    color: ${Colors.geekblue9};
  }
`;

export const SendOutlined = styled(RawSendOutlined)`
  transform: rotate(315deg) translate(3px, 0px);
`;

export const StartPageContainer = styled.div<{$height: number}>`
  width: 100%;
  height: ${({$height}) => $height}px;
  padding: 50px;
  background: ${Colors.black100};
  display: flex;
  flex-direction: column;
  gap: 50px;
`;
