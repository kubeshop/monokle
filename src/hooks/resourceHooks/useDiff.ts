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

export const useDiff = (resourceMeta?: ResourceMeta) => {
  const dispatch = useAppDispatch();
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const knownResourceKinds = useAppSelector(knownResourceKindsSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const selectedResourceMeta = useAppSelector(selectedResourceMetaSelector);

  const currentResourceMeta = resourceMeta || selectedResourceMeta;

  const isDisabled = useMemo(() => {
    if (!isKubeConfigPathValid) {
      return true;
    }
    if (!currentResourceMeta) {
      return true;
    }
    if (isKustomizationPatch(currentResourceMeta) || isKustomizationResource(currentResourceMeta)) {
      return true;
    }
    if (!knownResourceKinds.includes(currentResourceMeta.kind)) {
      return true;
    }
    return false;
  }, [isKubeConfigPathValid, currentResourceMeta, knownResourceKinds]);

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

    if (currentResourceMeta?.id) {
      dispatch(openResourceDiffModal(currentResourceMeta.id));
    }
  };

  return {diffSelectedResource, isDisabled, tooltipTitle};
};
