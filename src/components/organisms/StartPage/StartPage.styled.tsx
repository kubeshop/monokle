import {
  PlusOutlined as RawPlusOutlined,
  SendOutlined as RawSendOutlined,
  SettingOutlined as RawSettingsOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';
import {Device, size} from '@shared/styles/device';

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  overflow-y: auto;
  padding-right: 10px;
  width: 70%;

  @media (max-width: 944px) {
    width: 100%;
  }
`;

export const ContentTitle = styled.div`
  font-weight: 700;
  font-size: 28px;
  color: ${Colors.whitePure};
`;

export const MainContainer = styled.div`
  display: flex;
  width: 100%;
  overflow: hidden;
  height: 100%;
  justify-content: space-between;
`;

export const Menu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 10px;
  width: auto;
  margin-right: 20px;

  @media ${Device.laptopM} {
    width: 290px;
  }

  & div:last-child {
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
  padding: 50px 20px 50px 50px;
  background: ${Colors.black100};
  display: flex;
  flex-direction: column;
  gap: 50px;

  @media (max-width: ${size.laptopM}) {
    padding: 20px 20px 20px 20px;
  }
`;

export const NewsFeedContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 310px;

  @media (max-width: 944px) {
    display: none;
  }
`;

export const NewsFeed = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  border-radius: 5px;
  border: 1px solid ${Colors.grey10};
  height: 320px;
`;

export const NewsFeedBottom = styled.div`
  display: none;

  @media (max-width: 944px) {
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    border: 1px solid ${Colors.grey10};
    height: 150px;
  }
`;

export const NewsFeedHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  color: ${Colors.geekblue9};
  font-weight: 900;
  margin: 10px 0 10px 0;
`;

export const NewsFeedIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: ${Colors.grey10};
  margin-left: 10px;
  margin-right: 15px;
  border-radius: 30px;
`;

export const NewsFeedContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 20px 20px 20px;
  color: ${Colors.grey1000};
  overflow-y: scroll;
  /* Make the scrollbar appear only on hover */
  ::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }

  &:hover {
    ::-webkit-scrollbar {
      width: 8px;
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: ${Colors.grey10};
      border-radius: 5px;
    }
  }
`;

export const NewsFeedItemTime = styled.div`
  font-weight: 400;
  color: ${Colors.grey6};
  font-size: 12px;
  line-height: 20px;
`;

export const NewsFeedItemTimeBottom = styled.div`
  font-weight: 400;
  color: ${Colors.grey6};
  font-size: 12px;
  line-height: 20px;
  width: 80px;
`;

export const NewsFeedItemTitle = styled.div`
  font-weight: 400;
  font-size: 13px;
  color: ${Colors.grey7};
  line-height: 20px;
`;

export const NewsFeeditem = styled.div`
  display: flex;
  flex-direction: column;
  margin: 10px 0 10px 0;
  padding: 5px;
  border-radius: 5px;

  &:hover {
    cursor: pointer;
    ${NewsFeedItemTime} {
      color: ${Colors.grey7};
    }
    ${NewsFeedItemTitle} {
      color: ${Colors.grey9};
    }
  }
`;

export const NewsFeeditemBottom = styled.div`
  display: flex;
  margin: 2px 0 2px 0;
  border-radius: 5px;

  &:hover {
    cursor: pointer;
    ${NewsFeedItemTime} {
      color: ${Colors.grey7};
    }
    ${NewsFeedItemTitle} {
      color: ${Colors.grey9};
    }
  }
`;
