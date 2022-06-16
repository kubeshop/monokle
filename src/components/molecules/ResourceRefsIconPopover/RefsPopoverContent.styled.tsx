import {Divider as RawDivider, Typography} from 'antd';

import styled from 'styled-components';

export const Container = styled.div`
  margin: 0;
  padding: 0 8px;
  height: 100%;
  width: 100%;
  max-height: 350px;
  overflow-y: auto;
`;

export const Divider = styled(RawDivider)`
  margin: 5px 0;
`;

export const PopoverTitle = styled(Typography.Text)`
  font-weight: 500;
`;

export const RefDiv = styled.div`
  display: block;
  margin: 5px 0;
`;
