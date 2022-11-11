import {Select as RawSelect} from 'antd';

import {DeleteOutlined as RawDeleteOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@monokle-desktop/shared/styles/colors';

export const DeleteOutlined = styled(RawDeleteOutlined)`
  color: ${Colors.red7};
  display: none;

  &:hover {
    opacity: 0.8;
  }
`;

export const ReplaceWarning = styled.div`
  color: ${Colors.yellow7};
`;

export const Select = styled(RawSelect)`
  width: 100%;

  & .ant-select-selection-item .anticon {
    display: none;
  }
`;
