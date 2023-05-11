import {useMemo} from 'react';

import {HELM_CHART_ENTRY_FILE} from '@constants/constants';
import {ApplyFileTooltip, ApplyTooltip, InstallValuesFileTooltip, KubeConfigNoValid} from '@constants/tooltips';

import {kubeConfigPathValidSelector} from '@redux/appConfig';
import {useAppSelector} from '@redux/hooks';
import {selectionFilePathSelector} from '@redux/selectors';
import {knownResourceKindsSelector} from '@redux/selectors/resourceKindSelectors';
import {useSelectedResourceMeta} from '@redux/selectors/resourceSelectors';
import {isKustomizationPatch, isKustomizationResource} from '@redux/services/kustomize';

import {ResourceMeta} from '@shared/models/k8sResource';
import {isHelmTemplateFile, isHelmValuesFile} from '@shared/utils/helm';

export const useInstallDeploy = (resourceMeta?: ResourceMeta) => {
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const knownResourceKinds = useAppSelector(knownResourceKindsSelector);
  const selectedFilePath = useAppSelector(selectionFilePathSelector);
  const selectedResourceMeta = useSelectedResourceMeta();

  const currentResourceMeta = resourceMeta || selectedResourceMeta;

  const deployTooltip = useMemo(() => {
    return selectedFilePath
      ? isHelmValuesFile(selectedFilePath)
        ? InstallValuesFileTooltip
        : ApplyFileTooltip
      : ApplyTooltip;
  }, [selectedFilePath]);

  const buttonText = useMemo(
    () => (selectedFilePath && isHelmValuesFile(selectedFilePath) ? 'Install' : 'Deploy'),
    [selectedFilePath]
  );

  const isDisabled = useMemo(() => {
    if (!isKubeConfigPathValid) {
      return true;
    }

    if (!currentResourceMeta && !selectedFilePath) {
      return true;
    }

    if (selectedFilePath && selectedFilePath.endsWith(HELM_CHART_ENTRY_FILE)) {
      return true;
    }

    if (selectedFilePath && isHelmTemplateFile(selectedFilePath)) {
      return true;
    }

    if (
      currentResourceMeta &&
      !isKustomizationResource(currentResourceMeta) &&
      (isKustomizationPatch(currentResourceMeta) || !knownResourceKinds.includes(currentResourceMeta.kind))
    ) {
      return true;
    }
  }, [currentResourceMeta, isKubeConfigPathValid, knownResourceKinds, selectedFilePath]);

  const tooltipTitle = useMemo(
    () => (isKubeConfigPathValid ? deployTooltip : KubeConfigNoValid),
    [deployTooltip, isKubeConfigPathValid]
  );

  return {buttonText, isDisabled, tooltipTitle};
};
