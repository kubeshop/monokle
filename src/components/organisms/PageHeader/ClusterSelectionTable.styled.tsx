import {Table as RawTable} from 'antd';

import {EditOutlined as RawEditOutlined} from '@ant-design/icons/lib/icons';

import styled from 'styled-components';

import {ClusterColors} from '@models/cluster';

import Colors from '@styles/Colors';

export const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

export const ClusterAccessContainer = styled.span`
  padding: 5px;
`;

export const ClusterColor = styled.div<{
  $color: ClusterColors;
  $selected?: boolean;
  $size: 'small' | 'big';
}>`
  cursor: pointer;
  border-radius: 4px;

  ${({$color, $selected, $size}) => `
    background-color: ${$color};
    width: ${$size === 'big' ? '24' : '18'}px;
    height: ${$size === 'big' ? '24' : '18'}px;
    border: ${$size === 'big' && $selected ? '2' : '1'}px solid ${$selected ? Colors.blue6 : Colors.grey6};
  `}

  &:hover {
    border-color: ${Colors.blue6};
  }
`;

export const ClusterColorsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
`;

export const DefaultColorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;

  & span {
    font-size: 10px;
    color: ${Colors.grey7};
  }
`;

export const EditOutlined = styled(RawEditOutlined)`
  color: ${Colors.blue6};
`;

export const NamespacesTooltipContainer = styled.div`
  padding: 5px;
  display: flex;
  flex-direction: column;
`;

export const Table = styled(props => <RawTable {...props} />)`
  width: 840px;
  border-top: 1px solid ${Colors.grey3};

  tbody {
    vertical-align: top;
  }

  & .ant-table-container .ant-table-body {
    overflow-y: auto !important;
  }
`;

export const TitleText = styled.div`
  font-size: 10px;
  color: ${Colors.grey9};
  line-height: 16px;
  font-weight: 600;
`;
