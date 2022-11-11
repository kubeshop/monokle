import {Input} from 'antd';

import {rgba} from 'polished';
import styled from 'styled-components';

import Colors, {BackgroundColors} from '@styles/Colors';

import {ClusterColors} from '@monokle-desktop/shared/models';

const OutputTag = styled.div`
  font-size: 12px;
  border-radius: 4px;
  padding: 0px 5px;
  width: max-content;
  margin-top: 10px;
`;

export const ClusterOutputTag = styled(OutputTag)<{$kubeConfigContextColor: ClusterColors}>`
  ${({$kubeConfigContextColor}) => `
    color: ${$kubeConfigContextColor || Colors.volcano8};
    background: ${rgba($kubeConfigContextColor || Colors.volcano8, 0.2)};
  `}
`;

export const HelperLabel = styled.div`
  opacity: 0.5;
`;

export const ImagesCount = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`;

export const NameDisplayContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;

  padding: 16px 26px;
  font-size: 12px;
  color: ${Colors.grey9};

  &:hover {
    background-color: transparent;
  }
`;

export const PreviewOutputTag = styled(OutputTag)`
  color: ${BackgroundColors.previewModeBackground};
  background: ${rgba(BackgroundColors.previewModeBackground, 0.2)};
`;

export const SearchInput = styled(Input.Search)`
  & input::placeholder {
    color: ${Colors.grey7};
  }
`;
