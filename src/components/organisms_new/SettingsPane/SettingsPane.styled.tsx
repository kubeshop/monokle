import {Tabs as RawTabs} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const SettingsPaneContainer = styled.div`
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

export const DescriptionContainer = styled.div`
  padding: 8px 0px;
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
  justify-content: space-between;
  height: 70px;
  cursor: pointer;
  background: ${({$selected}) => ($selected ? 'rgba(255, 255, 255, 0.2)' : 'inherit')};
  border: ${({$selected}) => ($selected ? `2px solid ${Colors.blue7}` : `1px solid ${Colors.blue11}`)};
  padding: ${({$selected}) => ($selected ? '3px' : '4px')};
`;

export const LayoutContainer = styled.div`
  margin-right: 12px;
  padding: 4px 0 4px 4px;

  @media (max-width: 900px) {
    display: flex;
    align-items: center;
  }
`;

export const LayoutTitle = styled.div`
  color: ${Colors.whitePure};
  font-size: 12px;
  font-weight: 700;
`;

export const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
`;

export const LayoutContent = styled.div`
  color: ${Colors.whitePure};
  font-size: 12px;
  display: none;

  @media (min-width: 925px) {
    display: block;
  }
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
  height: calc(100% - 50px); // TODO: No hardcoded height

  & .ant-tabs-content {
    height: 100%;

    & .ant-tabs-tabpane {
      height: 100%;
    }
  }

  & .ant-tabs-nav::before {
    border-bottom: 1px solid #363636;
  }

  & .ant-tabs-extra-content {
    display: flex;
    align-items: center;
  }
`;

export const TabItemContainer = styled.div`
  background-color: ${Colors.grey10};
  padding: 16px;
  height: calc(100% - 100px); // TODO: No hardcoded height
  margin-top: 20px;
  overflow-y: auto;
`;

export const TabOption = styled.div`
  font-size: 16px;
  padding: 4px 0px;
  margin-top: 5px;
`;
