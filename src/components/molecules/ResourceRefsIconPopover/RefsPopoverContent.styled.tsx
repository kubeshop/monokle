import {Divider as RawDivider, Typography} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles';

export const Container = styled.div`
  margin: 0;
  padding: 0 8px;
  height: 100%;
  width: 100%;
  max-height: 350px;
`;

export const RefsContainer = styled.div`
  overflow-y: auto;
  max-height: 254px;
`;

export const Divider = styled(RawDivider)`
  margin: 5px 0;
`;

export const PopoverTitle = styled(Typography.Text)`
  font-weight: 500;
  color: ${Colors.grey9};
  font-weight: 400;
  font-size: 14px;
  height: 48px;
`;

export const RefDiv = styled.div`
  display: block;
  margin: 5px 0;
`;

export const PopoverFooter = styled(Typography.Text)`
  font-weight: 500;
  color: ${Colors.blue7};
  font-weight: 400;
  font-size: 14px;
  height: 48px;
  cursor: pointer;

  :hover {
    text-decoration: underline;
  }
`;

export const Image = styled.img`
  width: 15px;
  min-width: 15px;
  margin-right: 8px;
`;
