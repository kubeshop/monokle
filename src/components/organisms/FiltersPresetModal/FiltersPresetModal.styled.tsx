import {Select as RawSelect} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const ReplaceWarning = styled.div`
  color: ${Colors.yellow7};
`;

export const Select = styled(RawSelect)`
  width: 100%;
`;
