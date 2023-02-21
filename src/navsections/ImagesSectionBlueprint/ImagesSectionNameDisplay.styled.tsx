import {rgba} from 'polished';
import styled from 'styled-components';

import {ClusterColors} from '@shared/models/cluster';
import {BackgroundColors, Colors} from '@shared/styles/colors';

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

export const NameDisplayContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;

  padding: 16px 0px 16px 16px;
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
