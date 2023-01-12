import {
  PlusOutlined as RawPlusOutlined,
  SendOutlined as RawSendOutlined,
  SettingOutlined as RawSettingsOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';
import {Device} from '@shared/styles/device';

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  overflow-y: auto;
  padding-right: 10px;
`;

export const ContentTitle = styled.div`
  font-weight: 700;
  font-size: 28px;
  color: ${Colors.whitePure};
`;

export const MainContainer = styled.div`
  display: grid;
  grid-template-columns: 190px 1fr;
  grid-column-gap: 50px;
  overflow: hidden;
  height: 100%;

  @media ${Device.laptopM} {
    grid-template-columns: 190px 1fr 190px;
  }
`;

export const Menu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 10px;

  & div:nth-child(4) {
    margin-top: 50px;
  }

  & div:nth-child(5) {
    display: none;
  }
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

export const PlusOutlined = styled(RawPlusOutlined)`
  font-size: 16px;
  padding-top: 1px;
`;

export const SendOutlined = styled(RawSendOutlined)`
  transform: rotate(315deg) translate(3px, 0px);
  font-size: 16px;
`;

export const SettingsOutlined = styled(RawSettingsOutlined)`
  font-size: 16px;
  padding-top: 1px;
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
