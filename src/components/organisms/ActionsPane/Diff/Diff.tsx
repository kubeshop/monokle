import {useMemo} from 'react';

import {Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';
import {DiffTooltip, KubeConfigNoValid} from '@constants/tooltips';

import {K8sResource} from '@models/k8sresource';

import {useAppSelector} from '@redux/hooks';
import {knownResourceKindsSelector, kubeConfigPathValidSelector} from '@redux/selectors';
import {isKustomizationPatch, isKustomizationResource} from '@redux/services/kustomize';

import * as S from '../ActionsPaneHeader.styled';

interface IProps {
  selectedResource: K8sResource | undefined;
  diffSelectedResource: () => void;
}

const Diff = ({diffSelectedResource, selectedResource}: IProps) => {
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const knownResourceKinds = useAppSelector(knownResourceKindsSelector);

  const isDiffButtonDisabled = useMemo(() => {
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
  }, [selectedResource, knownResourceKinds, isKubeConfigPathValid]);

  return (
    <Tooltip
      mouseEnterDelay={TOOLTIP_DELAY}
      title={isKubeConfigPathValid ? DiffTooltip : KubeConfigNoValid}
      placement="bottomLeft"
    >
      <S.PrimaryButton size="small" type="primary" onClick={diffSelectedResource} disabled={isDiffButtonDisabled}>
        Diff
      </S.PrimaryButton>
    </Tooltip>
  );
};

export default Diff;
