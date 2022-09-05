import {useMemo} from 'react';

import {Button, Tooltip} from 'antd';

import {HELM_CHART_ENTRY_FILE, TOOLTIP_DELAY} from '@constants/constants';
import {ApplyFileTooltip, ApplyTooltip, InstallValuesFileTooltip, KubeConfigNoValid} from '@constants/tooltips';

import {K8sResource} from '@models/k8sresource';

import {useAppSelector} from '@redux/hooks';
import {knownResourceKindsSelector, kubeConfigPathValidSelector} from '@redux/selectors';
import {isHelmTemplateFile, isHelmValuesFile} from '@redux/services/helm';
import {isKustomizationPatch, isKustomizationResource} from '@redux/services/kustomize';

interface IProps {
  selectedResource: K8sResource | undefined;
  applySelection: () => void;
}

const InstallDeploy = ({applySelection, selectedResource}: IProps) => {
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const applyingResource = useAppSelector(state => state.main.isApplyingResource);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const knownResourceKinds = useAppSelector(knownResourceKindsSelector);

  const isDeployButtonDisabled = useMemo(() => {
    if (!isKubeConfigPathValid) {
      return true;
    }
    return (
      (!selectedResourceId && !selectedPath) ||
      (selectedPath && selectedPath.endsWith(HELM_CHART_ENTRY_FILE)) ||
      (selectedPath && isHelmTemplateFile(selectedPath)) ||
      (selectedResource &&
        !isKustomizationResource(selectedResource) &&
        (isKustomizationPatch(selectedResource) || !knownResourceKinds.includes(selectedResource.kind)))
    );
  }, [selectedResource, knownResourceKinds, selectedResourceId, selectedPath, isKubeConfigPathValid]);

  const deployTooltip = useMemo(() => {
    return selectedPath ? (isHelmValuesFile(selectedPath) ? InstallValuesFileTooltip : ApplyFileTooltip) : ApplyTooltip;
  }, [selectedPath]);

  return (
    <Tooltip
      mouseEnterDelay={TOOLTIP_DELAY}
      title={isKubeConfigPathValid ? deployTooltip : KubeConfigNoValid}
      placement="bottomLeft"
    >
      <Button
        loading={Boolean(applyingResource)}
        type="primary"
        size="small"
        ghost
        onClick={applySelection}
        disabled={isDeployButtonDisabled}
      >
        {selectedPath && isHelmValuesFile(selectedPath) ? 'Install' : 'Deploy'}
      </Button>
    </Tooltip>
  );
};

export default InstallDeploy;
