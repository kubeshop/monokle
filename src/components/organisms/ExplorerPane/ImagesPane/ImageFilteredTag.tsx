import {rgba} from 'polished';
import styled from 'styled-components';

import {isInClusterModeSelector, kubeConfigContextColorSelector} from '@redux/appConfig';
import {useAppSelector} from '@redux/hooks';

import {ClusterColors} from '@shared/models/cluster';
import {BackgroundColors, Colors} from '@shared/styles/colors';
import {isInPreviewModeSelector} from '@shared/utils/selectors';

const ImageFilteredTag: React.FC = () => {
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const kubeConfigContextColor = useAppSelector(kubeConfigContextColorSelector);

  if (isInClusterMode) {
    return (
      <ClusterOutputTag $kubeConfigContextColor={kubeConfigContextColor}>Filtered by Cluster Mode</ClusterOutputTag>
    );
  }

  if (isInPreviewMode) {
    return <PreviewOutputTag>Filtered By Preview Mode</PreviewOutputTag>;
  }

  return null;
};

export default ImageFilteredTag;

// Styled Components

const OutputTag = styled.div`
  font-size: 12px;
  border-radius: 4px;
  padding: 0px 5px;
  width: max-content;
  margin-top: 10px;
`;

const ClusterOutputTag = styled(OutputTag)<{$kubeConfigContextColor: ClusterColors}>`
  ${({$kubeConfigContextColor}) => `
    color: ${$kubeConfigContextColor || Colors.volcano8};
    background: ${rgba($kubeConfigContextColor || Colors.volcano8, 0.2)};
  `}
`;

const PreviewOutputTag = styled(OutputTag)`
  color: ${BackgroundColors.previewModeBackground};
  background: ${rgba(BackgroundColors.previewModeBackground, 0.2)};
`;
