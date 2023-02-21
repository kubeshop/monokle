import {useCallback, useMemo} from 'react';

import {DiffTooltip, KubeConfigNoValid} from '@constants/tooltips';

import {kubeConfigContextSelector, kubeConfigPathValidSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {openResourceDiffModal} from '@redux/reducers/main';
import {knownResourceKindsSelector} from '@redux/selectors/resourceKindSelectors';
import {useSelectedResourceMeta} from '@redux/selectors/resourceSelectors';
import {isKustomizationPatch, isKustomizationResource} from '@redux/services/kustomize';

import {AlertEnum, AlertType} from '@shared/models/alert';
import {ResourceMeta} from '@shared/models/k8sResource';

export const useDiff = (resourceMeta?: ResourceMeta) => {
  const dispatch = useAppDispatch();
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const knownResourceKinds = useAppSelector(knownResourceKindsSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const selectedResourceMeta = useSelectedResourceMeta();

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

  const diffSelectedResource = useCallback(() => {
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
  }, [currentResourceMeta?.id, kubeConfigContext, dispatch]);

  return {diffSelectedResource, isDisabled, tooltipTitle};
};
