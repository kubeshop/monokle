import {Divider as RawDivider, Typography} from 'antd';

import styled from 'styled-components';

import {Colors} from '@monokle-desktop/shared/styles';

const {Text} = Typography;

export const Container = styled.div`
  margin: 0;
  padding: 0 8px;
  height: 100%;
  width: 100%;
  max-height: 350px;
  overflow-y: auto;
`;

export const Description = styled.div`
  display: block;
  width: 600px;
  color: ${Colors.grey7};
`;

export const Divider = styled(RawDivider)`
  margin: 5px 0;
`;

export const PopoverTitle = styled(Text)`
  font-weight: 500;
`;

export const RefDiv = styled.div`
  display: block;
  margin: 5px 0;
`;
