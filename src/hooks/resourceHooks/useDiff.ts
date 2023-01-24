import {useMemo} from 'react';

import {DiffTooltip, KubeConfigNoValid} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {openResourceDiffModal} from '@redux/reducers/main';
import {knownResourceKindsSelector, selectedResourceMetaSelector} from '@redux/selectors';
import {isKustomizationPatch, isKustomizationResource} from '@redux/services/kustomize';

import {AlertEnum, AlertType} from '@shared/models/alert';
import {ResourceMeta} from '@shared/models/k8sResource';
import {kubeConfigContextSelector, kubeConfigPathValidSelector} from '@shared/utils/selectors';

export const useDiff = (resource?: ResourceMeta) => {
  const dispatch = useAppDispatch();
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const knownResourceKinds = useAppSelector(knownResourceKindsSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const selectedResourceMeta = useAppSelector(selectedResourceMetaSelector);

  const currentResource = resource || selectedResourceMeta;

  const isDisabled = useMemo(() => {
    if (!isKubeConfigPathValid) {
      return true;
    }
    if (!currentResource) {
      return true;
    }
    if (isKustomizationPatch(currentResource) || isKustomizationResource(currentResource)) {
      return true;
    }
    if (!knownResourceKinds.includes(currentResource.kind)) {
      return true;
    }
    return false;
  }, [isKubeConfigPathValid, currentResource, knownResourceKinds]);

  const tooltipTitle = useMemo(
    () => (isKubeConfigPathValid ? DiffTooltip : KubeConfigNoValid),
    [isKubeConfigPathValid]
  );

  const diffSelectedResource = () => {
    if (!kubeConfigContext) {
      const alert: AlertType = {
        type: AlertEnum.Error,
        title: 'Diff not available',
        message: 'No Cluster Configured',
      };

      dispatch(setAlert(alert));
      return;
    }

    if (currentResource?.id) {
      dispatch(openResourceDiffModal(currentResource.id));
    }
  };

  return {diffSelectedResource, isDisabled, tooltipTitle};
};
