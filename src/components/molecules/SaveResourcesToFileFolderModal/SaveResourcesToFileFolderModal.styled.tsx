import {Select as AntdSelect, Input} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Divider = styled.div`
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
`;

export const ErrorMessageLabel = styled.div`
  color: ${Colors.redError};
  margin-top: 10px;
`;

export const FileCategoryLabel = styled.div`
  color: ${Colors.grey7};
  margin-bottom: 6px;
  margin-top: 16px;
`;

export const SaveDestinationWrapper = styled(Input.Group)`
  display: grid !important;
  grid-template-columns: max-content 1fr;
`;

export const Select = styled(AntdSelect)`
  overflow-x: hidden;
`;
