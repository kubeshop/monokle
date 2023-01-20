import {Tabs as RawTabs} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const SettingsPaneContainer = styled.div<{$isOnStartProjectPage: boolean}>`
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: ${({$isOnStartProjectPage}) => ($isOnStartProjectPage ? 'transparent' : '#191f21')};
`;

export const WalkThroughContainer = styled.div`
  display: flex;
  align-items: center;
  height: 80px;
`;

export const WalkThroughTitle = styled.div`
  color: ${Colors.whitePure};
  font-size: 14px;
  font-weight: 700;
`;
export const WalkThroughContent = styled.div`
  color: ${Colors.grey9};
  font-size: 12px;
`;

export const WalkThroughAction = styled.span`
  color: ${Colors.blue7};
  font-weight: 700;
  padding-left: 3px;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

export const CurlyArrowImage = styled.img`
  background-color: rgba(82, 115, 224, 0.2);
  border-radius: 100%;
  padding: 16px;
  margin-right: 10px;
`;

export const ThemeOption = styled.div<{$selected?: boolean}>`
  border: 1px solid #164c7e;
  border-radius: 4px;
  display: flex;
  height: 70px;
  cursor: pointer;
  background: ${({$selected}) => ($selected ? 'rgba(255, 255, 255, 0.2)' : 'inherit')};
  border: ${({$selected}) => ($selected ? `2px solid ${Colors.blue7}` : `1px solid ${Colors.blue11}`)};
  padding: ${({$selected}) => ($selected ? '3px' : '4px')};
`;

export const Tabs = styled(RawTabs)`
  width: 100%;
  height: 100%;

  & .ant-tabs-content {
    height: 100%;

    & .ant-tabs-tabpane {
      height: 100%;
    }
  }

  & .ant-tabs-nav {
    padding: 0px 16px 0px 16px;

    &::before {
      border-bottom: 1px solid #363636;
    }
  }

  & .ant-tabs-nav::before {
  }

  & .ant-tabs-extra-content {
    display: flex;
    align-items: center;
  }
`;

export const TabItemContainer = styled.div<{$isOnStartProjectPage: boolean}>`
  background-color: ${Colors.grey10};
  padding: 16px;
  height: ${({$isOnStartProjectPage}) =>
    !$isOnStartProjectPage ? 'calc(100% - 50px)' : '100%'}; // TODO: No hardcoded height: ;
  overflow-y: auto;
`;

export const TabOption = styled.div`
  font-size: 16px;
  padding: 4px 0px;
  margin-top: 5px;
`;
