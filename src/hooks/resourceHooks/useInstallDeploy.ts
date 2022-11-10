import {useMemo} from 'react';

import {HELM_CHART_ENTRY_FILE} from '@constants/constants';
import {ApplyFileTooltip, ApplyTooltip, InstallValuesFileTooltip, KubeConfigNoValid} from '@constants/tooltips';

import {useAppSelector} from '@redux/hooks';
import {knownResourceKindsSelector, kubeConfigPathValidSelector} from '@redux/selectors';
import {isHelmTemplateFile, isHelmValuesFile} from '@redux/services/helm';
import {isKustomizationPatch, isKustomizationResource} from '@redux/services/kustomize';

import {K8sResource} from '@monokle-desktop/shared';

export const useInstallDeploy = (resource?: K8sResource) => {
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const knownResourceKinds = useAppSelector(knownResourceKindsSelector);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const selectedResource = useAppSelector(state =>
    selectedResourceId ? state.main.resourceMap[selectedResourceId] : undefined
  );

  const currentResource = resource || selectedResource;

  const deployTooltip = useMemo(() => {
    return selectedPath ? (isHelmValuesFile(selectedPath) ? InstallValuesFileTooltip : ApplyFileTooltip) : ApplyTooltip;
  }, [selectedPath]);

  const buttonText = useMemo(
    () => (selectedPath && isHelmValuesFile(selectedPath) ? 'Install' : 'Deploy'),
    [selectedPath]
  );

  const isDisabled = useMemo(() => {
    if (!isKubeConfigPathValid) {
      return true;
    }

    if (!currentResource && !selectedPath) {
      return true;
    }

    if (selectedPath && selectedPath.endsWith(HELM_CHART_ENTRY_FILE)) {
      return true;
    }

    if (selectedPath && isHelmTemplateFile(selectedPath)) {
      return true;
    }

    if (
      currentResource &&
      !isKustomizationResource(currentResource) &&
      (isKustomizationPatch(currentResource) || !knownResourceKinds.includes(currentResource.kind))
    ) {
      return true;
    }
  }, [currentResource, isKubeConfigPathValid, knownResourceKinds, selectedPath]);

  const tooltipTitle = useMemo(
    () => (isKubeConfigPathValid ? deployTooltip : KubeConfigNoValid),
    [deployTooltip, isKubeConfigPathValid]
  );

  return {buttonText, isDisabled, tooltipTitle};
};
