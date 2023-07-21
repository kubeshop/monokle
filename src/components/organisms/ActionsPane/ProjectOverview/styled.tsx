import {Typography} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles';

export const Container = styled.div`
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
`;

export const Title = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-radius: 4px;

  & .ant-typography {
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 22px !important;
    margin-bottom: 0;
    text-align: center;
  }

  .weight-700 {
    font-weight: 700 !important;
  }
`;

export const CardContainer = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
  > * {
    flex: 1;
  }
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
`;

export const CardTitle = styled(Typography.Title)`
  background-color: ${Colors.grey10};
  padding: 4px 12px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;

  &.ant-typography {
    font-size: 14px;
    font-weight: 600;
    line-height: 22px;
    color: ${Colors.grey9};
    margin-bottom: 0;
  }
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #191f21b2;
  padding: 24px;
  padding-bottom: 16px;
  height: 100%;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
`;

export const Text = styled(Typography.Text)`
  cursor: ${({onClick}) => (onClick ? 'pointer' : 'default')};

  &.ant-typography {
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
    color: ${Colors.grey9};
  }

  &.ant-typography:hover {
    color: ${({onClick}) => (onClick ? Colors.whitePure : 'currentColor')};
  }
`;

export const Link = styled(Typography.Link)`
  cursor: ${({onClick}) => (onClick ? 'pointer' : 'default')};

  &.ant-typography {
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: 22px;
  }
`;

export const GreyText = styled(Typography.Text)`
  &.ant-typography {
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
    color: ${Colors.grey7};
  }
`;

export const SmallText = styled(Typography.Text)`
  &.ant-typography {
    font-size: 12px;
    line-height: 18px;
  }
`;

export const CountChip = styled.span<{$type: 'error' | 'warning' | 'resource'}>`
  display: flex;
  align-items: center;
  border-radius: 4px;
  margin-bottom: 8px;
  justify-content: space-between;
  width: 100%;
  height: ${props => (props.$type === 'resource' ? '90px' : '56px')};
  padding: 8px 20px;
  cursor: ${({onClick}) => (onClick ? 'pointer' : 'default')};

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;

  ${props =>
    `border-left: 4px solid ${
      (props.$type === 'warning' && Colors.yellow12) ||
      (props.$type === 'error' && Colors.red7) ||
      (props.$type === 'resource' && Colors.grey5000)
    };
    background-color: ${
      (props.$type === 'warning' && 'rgba(232, 179, 57, 0.1)') ||
      (props.$type === 'error' && 'rgba(232, 71, 73, 0.1)') ||
      (props.$type === 'resource' && 'rgba(82, 115, 224, 0.1)')
    };
    color: ${
      (props.$type === 'warning' && Colors.yellow12) ||
      (props.$type === 'error' && Colors.red7) ||
      (props.$type === 'resource' && Colors.geekblue7)
    } ;
    `}

  & .ant-typography {
    color: ${props =>
      (props.$type === 'warning' && Colors.yellow12) ||
      (props.$type === 'error' && Colors.red7) ||
      (props.$type === 'resource' && Colors.geekblue7)};
  }

  .clickable-text:hover {
    & .ant-typography {
      color: ${props =>
        (props.$type === 'warning' && Colors.yellow10) ||
        (props.$type === 'error' && Colors.volcano8) ||
        (props.$type === 'resource' && Colors.geekblue9)};
    }
  }
`;

export const ResourcesContainer = styled.div<{$hasResources: boolean}>`
  & .ant-typography {
    color: ${props => (props.$hasResources ? Colors.geekblue7 : Colors.red7)};
  }
`;

export const CountContainer = styled.div`
  cursor: ${onClick => (onClick ? 'pointer' : 'default')};
`;

export const Count = styled(Typography.Text)`
  display: flex;
  gap: 4px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;

  &.ant-typography {
    display: flex;
    font-size: 32px;
    line-height: 24px;
  }
`;
