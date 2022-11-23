import {rgba} from 'polished';
import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';
import {isInClusterModeSelector, kubeConfigContextColorSelector} from '@redux/selectors';

import {ClusterColors} from '@monokle-desktop/shared/models/cluster';
import {BackgroundColors, Colors} from '@monokle-desktop/shared/styles/colors';
import {isInPreviewModeSelector} from '@monokle-desktop/shared/utils/selectors';

const S = {
  PreviewOutputTag: styled.div`
    font-size: 12px;
    margin-bottom: 10px;
    border-radius: 4px;
    padding: 0px 5px;
    color: ${BackgroundColors.previewModeBackground};
    background: ${rgba(BackgroundColors.previewModeBackground, 0.2)};
  `,
  ClusterOutputTag: styled.div<{$kubeConfigContextColor: ClusterColors}>`
    font-size: 12px;
    margin-bottom: 10px;
    border-radius: 4px;
    padding: 0px 5px;

    ${({$kubeConfigContextColor}) => `
      color: ${$kubeConfigContextColor || Colors.volcano8};
      background: ${rgba($kubeConfigContextColor || Colors.volcano8, 0.2)};
    `}
  `,
};

function K8sResourceSectionNameSuffix() {
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const kubeConfigContextColor = useAppSelector(kubeConfigContextColorSelector);

  if (isInClusterMode) {
    return (
      <S.ClusterOutputTag $kubeConfigContextColor={kubeConfigContextColor}>Filtered by Cluster Mode</S.ClusterOutputTag>
    );
  }

  if (isInPreviewMode) {
    return <S.PreviewOutputTag>Filtered By Preview Mode</S.PreviewOutputTag>;
  }

  return null;
}

export default K8sResourceSectionNameSuffix;
