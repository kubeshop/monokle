import {useCallback} from 'react';

import {Select} from 'antd';

import {isEmpty} from 'lodash';

import {ResourceSet, resourceSetSelected, selectResourceSet} from '@redux/compare';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {kubeConfigPathValidSelector} from '@redux/selectors';
import {isKustomizationResource} from '@redux/services/kustomize';

import * as S from './ResourceSetSelectColor.styled';

type Props = {
  side: 'left' | 'right';
};

export const ResourceSetTypeSelect: React.FC<Props> = ({side}) => {
  const dispatch = useAppDispatch();
  const isGitDisabled = useAppSelector(state => Boolean(!state.git.repo));
  const isHelmDisabled = useAppSelector(state => isEmpty(state.main.helmChartMap));
  const isCommandDisabled = useAppSelector(state => isEmpty(state.config.projectConfig?.savedCommandMap));
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const isKustomizeDisabled = useAppSelector(
    state => !Object.values(state.main.resourceMap).filter(r => isKustomizationResource(r)).length
  );
  const resourceSet = useAppSelector(state => selectResourceSet(state.compare, side));

  const handleSelectType = useCallback(
    (type: ResourceSet['type']) => {
      dispatch(resourceSetSelected({side, value: {type}}));
    },
    [dispatch, side]
  );

  return (
    <S.SelectColor>
      <Select
        onChange={handleSelectType}
        placeholder="Choose…"
        value={resourceSet?.type === 'helm-custom' ? 'helm' : resourceSet?.type}
        style={{width: 180}}
      >
        <Select.Option value="local">Local</Select.Option>
        <Select.Option value="cluster" disabled={!isKubeConfigPathValid}>
          Cluster
        </Select.Option>
        <Select.Option disabled={isHelmDisabled} value="helm">
          Helm Preview
        </Select.Option>
        <Select.Option disabled={isKustomizeDisabled} value="kustomize">
          Kustomize Preview
        </Select.Option>
        <Select.Option disabled={isGitDisabled} value="git">
          Git
        </Select.Option>
        <Select.Option disabled={isCommandDisabled} value="command">
          Command
        </Select.Option>
      </Select>
    </S.SelectColor>
  );
};
