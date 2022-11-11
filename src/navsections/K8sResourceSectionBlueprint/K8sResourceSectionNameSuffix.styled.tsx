import {rgba} from 'polished';
import styled from 'styled-components';

import {ClusterColors} from '@monokle-desktop/shared/models';
import {BackgroundColors, Colors} from '@monokle-desktop/shared/styles';

const OutputTag = styled.div`
  font-size: 12px;
  margin-bottom: 10px;
  border-radius: 4px;
  padding: 0px 5px;
`;

export const Container = styled.span`
  display: flex;
  align-items: center;
`;

export const ClusterOutputTag = styled(OutputTag)<{$kubeConfigContextColor: ClusterColors}>`
  ${({$kubeConfigContextColor}) => `
      color: ${$kubeConfigContextColor || Colors.volcano8};
      background: ${rgba($kubeConfigContextColor || Colors.volcano8, 0.2)};
    `}
`;

export const PreviewOutputTag = styled(OutputTag)`
  background: ${rgba(BackgroundColors.previewModeBackground, 0.2)};
  color: ${rgba(BackgroundColors.previewModeBackground)};
`;
