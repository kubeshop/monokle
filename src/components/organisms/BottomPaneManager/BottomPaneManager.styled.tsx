import {CloseOutlined as RawCloseOutlined, PlusCircleFilled as RawPlusCircleFilled} from '@ant-design/icons';

import styled from 'styled-components';

import {AppBorders} from '@styles/Borders';
import Colors, {PanelColors} from '@styles/Colors';

export const BottomPaneManagerContainer = styled.div`
  height: 100%;
  border-left: 9px solid ${PanelColors.toolBar};
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
  color: ${({$selected}) => ($selected ? Colors.blue6 : Colors.whitePure)};
  font-weight: ${({$selected}) => ($selected ? '700' : '400')};
  ${({$selected}) => ($selected ? `border-bottom: 1px solid ${Colors.blue6}` : '')};
`;

export const Tabs = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

export const TabsContainer = styled.div`
  display: flex;
  border-bottom: ${AppBorders.sectionDivider};
  padding: 0px 10px;
`;
