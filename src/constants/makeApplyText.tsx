import styled from 'styled-components';

import {ClusterColors} from '@models/cluster';

import Colors, {BackgroundColors} from '@styles/Colors';

const ClusterName = styled.div<{$kubeConfigContextColor?: ClusterColors}>`
  display: inline;
  border-radius: 4px;
  color: ${Colors.blackPure};
  margin: 0 5px;
  padding: 0 2px;

  ${({$kubeConfigContextColor}) => `
    background-color: ${$kubeConfigContextColor || BackgroundColors.clusterModeBackground};
  `}
`;

export const makeApplyKustomizationText = (
  name: string,
  context: string | undefined,
  kubeConfigContextColor: ClusterColors
) => (
  <>
    Deploy {name} kustomization to{' '}
    <ClusterName $kubeConfigContextColor={kubeConfigContextColor}>{context || ''}</ClusterName> ?
  </>
);

export const makeApplyResourceText = (
  name: string,
  context: string | undefined,
  kubeConfigContextColor: ClusterColors
) => (
  <>
    Deploy {name} to <ClusterName $kubeConfigContextColor={kubeConfigContextColor}>{context || ''}</ClusterName> ?
  </>
);

export const makeReplaceResourceText = (
  name: string,
  context: string | undefined,
  kubeConfigContextColor: ClusterColors
) => (
  <>
    Replace {name} with <ClusterName $kubeConfigContextColor={kubeConfigContextColor}>{context || ''}</ClusterName>{' '}
    source?
  </>
);

export const makeApplyMultipleResourcesText = (
  length: number,
  context: string | undefined,
  kubeConfigContextColor: ClusterColors
) => (
  <>
    Deploy selected resources ({length}) to{' '}
    <ClusterName $kubeConfigContextColor={kubeConfigContextColor}>{context || ''}</ClusterName> ?
  </>
);
