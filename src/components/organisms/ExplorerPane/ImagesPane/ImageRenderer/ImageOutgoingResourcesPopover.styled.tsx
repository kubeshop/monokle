import {Divider as RawDivider, Typography} from 'antd';

import styled from 'styled-components';

import {Colors, FontColors} from '@shared/styles/colors';

export const Container = styled.div`
  margin: 0;
  padding: 0 8px;
  max-height: 350px;
  overflow-y: auto;
`;

export const Divider = styled(RawDivider)`
  margin: 5px 0;
`;

export const PopoverTitle = styled(Typography.Text)`
  font-weight: 500;
`;

export const PositionText = styled.span`
  margin-left: 5px;
  color: ${FontColors.grey};
`;

export const RefContainer = styled.div`
  display: block;
  margin: 5px 0;
`;

export const RefLinkContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const ResourceKindLabel = styled.span`
  margin-left: 8px;
  font-style: italic;
  color: ${Colors.grey7};
`;

export const ResourceNameLabel = styled.span`
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;
