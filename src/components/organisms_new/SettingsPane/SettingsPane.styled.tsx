import {Tabs as RawTabs} from 'antd';

import styled from 'styled-components';

import {Colors} from '@monokle-desktop/shared/styles/colors';

export const SettingsPaneContainer = styled.div`
  padding: 10px;
  background-color: ${Colors.grey10};
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

export const DescriptionContainer = styled.div`
  padding: 8px 4px;
  display: flex;
  justify-content: space-between;
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

export const LayoutOption = styled.div<{$selected?: boolean}>`
  border-radius: 4px;
  display: flex;
  height: 80px;
  cursor: pointer;
  background: ${({$selected}) => ($selected ? 'rgba(255, 255, 255, 0.2)' : 'inherit')};
  border: ${({$selected}) => ($selected ? `2px solid ${Colors.blue7}` : `1px solid ${Colors.blue11}`)};
  padding: ${({$selected}) => ($selected ? '3px' : '4px')};
`;

export const LayoutContainer = styled.div`
  margin-right: 12px;
  padding: 4px 0 4px 4px;
`;

export const LayoutTitle = styled.div`
  color: ${Colors.whitePure};
  font-size: 13px;
  font-weight: 700;
`;
export const LayoutContent = styled.div`
  color: ${Colors.whitePure};
  font-size: 12px;
`;

export const ThemeOption = styled.div<{$selected?: boolean}>`
  border: 1px solid #164c7e;
  border-radius: 4px;
  display: flex;
  height: 80px;
  cursor: pointer;
  background: ${({$selected}) => ($selected ? 'rgba(255, 255, 255, 0.2)' : 'inherit')};
  border: ${({$selected}) => ($selected ? `2px solid ${Colors.blue7}` : `1px solid ${Colors.blue11}`)};
  padding: ${({$selected}) => ($selected ? '3px' : '4px')};
`;

export const Tabs = styled(RawTabs)<{$height: number}>`
  width: 100%;
  height: ${({$height}) => `${$height}px`};
  overflow: visible;

  & .ant-tabs-nav {
    padding: 0 16px;
    margin-bottom: 0px;
  }

  & .ant-tabs-nav::before {
    border-bottom: 1px solid #363636;
  }

  & .ant-tabs-content {
    height: ${({$height}) => $height - 46}px;
  }

  & .ant-tabs-extra-content {
    display: flex;
    align-items: center;
  }
`;

export const TabItemContainer = styled.div`
  padding: 16px;
  height: 100%;
  overflow-y: scroll;
`;
