import {DeleteOutlined as RawDeleteOutlined, EditOutlined as RawEditOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@monokle-desktop/shared/styles/colors';

export const LabelContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const DeleteOutlined = styled(RawDeleteOutlined)`
  color: ${Colors.red7};

  &:hover {
    opacity: 0.8;
  }
`;

export const EditOutlined = styled(RawEditOutlined)`
  color: ${Colors.blue6};

  &:hover {
    opacity: 0.8;
  }
`;

export const PreviewedLabel = styled.span`
  color: ${Colors.purple8};
`;
