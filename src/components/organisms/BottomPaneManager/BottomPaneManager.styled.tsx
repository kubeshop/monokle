import {Popconfirm as RawPopconfirm} from 'antd';

import {
  CaretDownFilled as RawCaretDownFilled,
  CloseOutlined as RawCloseOutlined,
  DownOutlined as RawDownOutlined,
  EllipsisOutlined as RawEllipsisOutlined,
  PlusCircleFilled as RawPlusCircleFilled,
} from '@ant-design/icons';

import {rgba} from 'polished';
import styled from 'styled-components';

import {AppBorders} from '@styles/Borders';

import {Colors, PanelColors} from '@monokle-desktop/shared/styles/Colors';

export const BottomPaneManagerContainer = styled.div<{$isLeftMenuActive: boolean}>`
  height: 100%;

  ${({$isLeftMenuActive}) => {
    if ($isLeftMenuActive) {
      return `border-left: 9px solid ${PanelColors.toolBar}`;
    }
  }}
`;

export const CaretDownFilled = styled(RawCaretDownFilled)`
  color: ${Colors.whitePure};
`;

export const CloseOutlined = styled(RawCloseOutlined)`
  color: ${Colors.grey6};
`;

export const DownOutlined = styled(RawDownOutlined)`
  cursor: pointer;
  font-size: 12px;
`;

export const EllipsisOutlined = styled(RawEllipsisOutlined)`
  font-size: 16px;
  cursor: pointer;
`;

export const NewTabActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${Colors.blue6};
`;

export const PlusCircleFilled = styled(RawPlusCircleFilled)`
  font-size: 16px;
  cursor: pointer;
`;

export const PodNamespaceLabel = styled.span`
  font-style: italic;
  color: ${Colors.grey6};
`;

export const Popconfirm = styled(RawPopconfirm)`
  z-index: 10000;
`;

export const Tab = styled.div<{$selected: boolean}>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 1px;
  cursor: pointer;
  color: ${({$selected}) => ($selected ? Colors.blue6 : rgba(Colors.whitePure, 0.85))};
  font-weight: 600;
  ${({$selected}) => ($selected ? `border-bottom: 2px solid ${Colors.blue6}` : '')};

  &:first-child {
    margin-left: 10px;
  }
`;

export const TabName = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

export const Tabs = styled.div<{$count: number}>`
  display: grid;
  grid-template-columns: ${({$count}) => `repeat(${$count + 1}, max-content)`};
  grid-column-gap: 20px;
  overflow-x: auto;
`;

export const TabsActions = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

export const TabsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: ${AppBorders.sectionDivider};
  padding-right: 10px;
  gap: 10px;
`;
