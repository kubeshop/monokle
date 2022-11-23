import {Row} from 'antd';

import styled from 'styled-components';

export const ContentDiv = styled.div`
  margin-right: -8px;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
`;

export const ActionsRow = styled(Row)`
  margin-top: 20px;
  align-items: center;
`;

export const ResourceSetSelectorsContainer = styled.div<{$show: boolean}>`
  display: ${({$show}) => ($show ? 'block' : 'none')};
`;
