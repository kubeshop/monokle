import {useCallback, useMemo} from 'react';

import {DiffTooltip, KubeConfigNoValid} from '@constants/tooltips';

import {AlertEnum, AlertType} from '@models/alert';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {openResourceDiffModal} from '@redux/reducers/main';
import {knownResourceKindsSelector, kubeConfigContextSelector, kubeConfigPathValidSelector} from '@redux/selectors';
import {isKustomizationPatch, isKustomizationResource} from '@redux/services/kustomize';

export const useDiff = () => {
  const dispatch = useAppDispatch();
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const knownResourceKinds = useAppSelector(knownResourceKindsSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const selectedResource = useAppSelector(state =>
    state.main.selectedResourceId ? state.main.resourceMap[state.main.selectedResourceId] : undefined
  );

  const isDisabled = useMemo(() => {
    if (!isKubeConfigPathValid) {
      return true;
    }
    if (!selectedResource) {
      return true;
    }
    if (isKustomizationPatch(selectedResource) || isKustomizationResource(selectedResource)) {
      return true;
    }
    if (!knownResourceKinds.includes(selectedResource.kind)) {
      return true;
    }
    return false;
  }, [isKubeConfigPathValid, selectedResource, knownResourceKinds]);

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

    if (selectedResource?.id) {
      dispatch(openResourceDiffModal(selectedResource.id));
    }
  }, [dispatch, kubeConfigContext, selectedResource]);

  return {diffSelectedResource, isDisabled, tooltipTitle};
};
