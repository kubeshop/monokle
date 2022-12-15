import {Button as RawButton, Input as RawInput} from 'antd';

import {
  CheckCircleFilled as RawCheckCircleFilled,
  DownOutlined as RawDownOutlined,
  FilterOutlined as RawFilterOutlined,
  SearchOutlined as RawSearchOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import {TitleBar} from '@monokle/components';
import {Colors} from '@shared/styles/colors';

export const Container = styled.div`
  padding: 16px 0px 16px 0;
`;

export const HeaderContainer = styled.div`
  padding: 0px 16px 16px 16px;
`;

export const MainSection = styled.div<{$active: boolean; $clickable: boolean}>`
  padding: 0 0 0 16px;
  font-size: 16px;
  line-height: 36px;
  font-weight: 600;

  ${props =>
    props.$clickable &&
    `
    :hover {
      background-color: rgba(255, 255, 255, 0.08);
      color: ${Colors.grey9};
    }
  `}

  ${props => `
    color: ${props.$active ? Colors.grey6000 : Colors.whitePure};
    background-color: ${props.$active ? Colors.blue9 : 'transparent'};
    cursor:${props.$clickable ? 'pointer' : 'inherit'};`}
`;
export const SubSection = styled.div<{$active: boolean}>`
  padding: 0 0 0 16px;
  font-size: 14px;
  line-height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;

  :hover {
    background-color: rgba(255, 255, 255, 0.08);
    color: ${Colors.grey9};
  }

  ${props => `
    color: ${props.$active ? Colors.grey6000 : Colors.grey9};
    background-color: ${props.$active ? Colors.blue9 : 'transparent'}`}
`;

export const ClusterName = styled(TitleBar)`
  & > div:first-child {
    font-size: 14px;
    color: ${Colors.whitePure};
  }
`;

export const CheckCircleFilled = styled(RawCheckCircleFilled)`
  color: ${Colors.polarGreen};
  margin-right: 4px;
`;

export const ConnectedText = styled.span`
  color: ${Colors.polarGreen};
  font-weight: 600;
  font-size: 10px;
`;

export const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  grid-area: filter;
`;

export const Input = styled(RawInput)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  border: none;
`;
export const SearchOutlined = styled(RawSearchOutlined)`
  color: ${Colors.grey6};
`;

export const DownOutlined = styled(RawDownOutlined)``;

export const FilterAction = styled(RawButton)`
  border: none;
`;

export const FilterOutlined = styled(RawFilterOutlined)`
  color: ${Colors.blue7};
`;
