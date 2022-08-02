import {
  CaretDownFilled as RawCaretDownFilled,
  CloseOutlined as RawCloseOutlined,
  PlusCircleFilled as RawPlusCircleFilled,
} from '@ant-design/icons';

import {rgba} from 'polished';
import styled from 'styled-components';

import {AppBorders} from '@styles/Borders';
import Colors, {PanelColors} from '@styles/Colors';

export const BottomPaneManagerContainer = styled.div`
  height: 100%;
  border-left: 9px solid ${PanelColors.toolBar};
`;

export const CaretDownFilled = styled(RawCaretDownFilled)`
  color: ${Colors.whitePure};
`;

export const CloseOutlined = styled(RawCloseOutlined)`
  color: ${Colors.grey6};
`;

export const PlusCircleFilled = styled(RawPlusCircleFilled)`
  color: ${Colors.blue6};
  font-size: 16px;
  cursor: pointer;
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
`;

export const Tabs = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0px 20px;
`;

export const TabsActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const TabsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: ${AppBorders.sectionDivider};
  padding: 0px 10px;
`;
