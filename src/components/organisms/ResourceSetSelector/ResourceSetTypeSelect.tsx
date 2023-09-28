import {useCallback} from 'react';
import {useMount} from 'react-use';

import {Select} from 'antd';

import {isEmpty} from 'lodash';

import {kubeConfigPathValidSelector} from '@redux/appConfig';
import {resourceSetSelected, selectResourceSet} from '@redux/compare';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {kustomizationsSelector} from '@redux/selectors/resourceSelectors';

import {ResourceSet} from '@shared/models/compare';

import * as S from './ResourceSetSelectColor.styled';

type Props = {
  side: 'left' | 'right';
};

export const ResourceSetTypeSelect: React.FC<Props> = ({side}) => {
  const dispatch = useAppDispatch();
  const currentContext = useAppSelector(state => state.main.clusterConnection?.context);
  const isInQuickClusterMode = useAppSelector(state => state.ui.isInQuickClusterMode);
  const isGitDisabled = useAppSelector(state => Boolean(!state.git.repo));
  const isHelmDisabled = useAppSelector(state => isEmpty(state.main.helmChartMap));
  const isCommandDisabled = useAppSelector(state =>
    isEmpty(Object.values(state.config.projectConfig?.savedCommandMap || {}).filter(command => Boolean(command)))
  );
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  // TODO: we should make a selector for kustomizations count
  const isKustomizeDisabled = useAppSelector(state => isEmpty(kustomizationsSelector(state)));
  const resourceSet = useAppSelector(state => selectResourceSet(state.compare, side));

  useMount(() => {
    if (!isInQuickClusterMode) return;
    if (side === 'left') {
      dispatch(resourceSetSelected({side, value: {type: 'cluster', context: currentContext}}));
    }
    if (side === 'right') {
      dispatch(resourceSetSelected({side, value: {type: 'cluster'}}));
    }
  });

  const handleSelectType = useCallback(
    (type: ResourceSet['type']) => {
      if (type === 'local' || type === 'git') {
        dispatch(resourceSetSelected({side, value: {type, folder: '<root>'}}));
      } else {
        dispatch(resourceSetSelected({side, value: {type}}));
      }
    },
    [dispatch, side]
  );

  return (
    <S.SelectColor $isMainSelector>
      <Select
        onChange={handleSelectType}
        placeholder="Choose…"
        value={resourceSet?.type === 'helm-custom' ? 'helm' : resourceSet?.type}
        style={{width: 180}}
      >
        {!isInQuickClusterMode && <Select.Option value="local">Local</Select.Option>}
        <Select.Option value="cluster" disabled={!isKubeConfigPathValid}>
          Cluster
        </Select.Option>
        {!isInQuickClusterMode && (
          <>
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
          </>
        )}
      </Select>
    </S.SelectColor>
  );
};
