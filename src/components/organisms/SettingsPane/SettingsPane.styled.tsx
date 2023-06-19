import {Tabs as RawTabs} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const SettingsPaneContainer = styled.div<{
  $isOnStartProjectPage: boolean;
  $isInQuickClusterMode: boolean;
}>`
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: ${({$isOnStartProjectPage, $isInQuickClusterMode}) =>
    $isOnStartProjectPage && !$isInQuickClusterMode ? 'transparent' : '#191f21'};
  padding: ${({$isInQuickClusterMode}) => ($isInQuickClusterMode ? '0px 20px' : '0px')};
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

export const TabOption = styled.div`
  font-size: 16px;
  padding: 4px 0px 6px 0px;
  margin-top: 5px;
  color: ${Colors.grey7};
`;

export const Tabs = styled(RawTabs)<{$isOnStartProjectPage: boolean}>`
  width: 100%;
  height: 100%;

  & .ant-tabs-content {
    height: 100%;

    & .ant-tabs-tabpane {
      height: 100%;
    }
  }

  & .ant-tabs-nav {
    padding: ${({$isOnStartProjectPage}) => ($isOnStartProjectPage ? '0px 0px 12px 0px' : '0px 16px 12px 16px')};

    &::before {
      border-bottom: none;
    }
  }

  & .ant-tabs-extra-content {
    display: flex;
    align-items: center;
  }

  & .ant-tabs-ink-bar {
    background-color: ${Colors.grey9};
  }

  & .ant-tabs-tab-active ${TabOption} {
    color: ${Colors.grey9};
  }
`;

export const TabItemContainer = styled.div<{$isOnStartProjectPage: boolean}>`
  padding: ${({$isOnStartProjectPage}) => ($isOnStartProjectPage ? '16px 0px' : '16px')};
  height: ${({$isOnStartProjectPage}) =>
    !$isOnStartProjectPage ? 'calc(100% - 70px)' : '100%'}; // TODO: No hardcoded height: ;
  overflow-y: auto;
`;
