import {useCallback} from 'react';

import {Button, Select, Space, Tooltip} from 'antd';

import {ClearOutlined, ReloadOutlined} from '@ant-design/icons';

import styled from 'styled-components';
import invariant from 'tiny-invariant';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  PartialResourceSet,
  ResourceSet,
  resourceSetCleared,
  resourceSetRefreshed,
  resourceSetSelected,
  selectClusterResourceSet,
  selectHelmResourceSet,
  selectKustomizeResourceSet,
  selectResourceSet,
} from '@redux/reducers/compare';

import * as S from './ResourceSetSelector.styled';

type Props = {
  side: 'left' | 'right';
};

export const ResourceSetSelector: React.FC<Props> = ({side}: Props) => {
  const dispatch = useAppDispatch();
  const resourceSet = useAppSelector(state => selectResourceSet(state.compare, side));

  const handleRefresh = useCallback(() => {
    dispatch(resourceSetRefreshed({side}));
  }, [dispatch, side]);

  const handleClear = useCallback(() => {
    dispatch(resourceSetCleared({side}));
  }, [dispatch, side]);

  return (
    <S.ResourceSetSelectorDiv>
      <MySpacer>
        <ResourceSetTypeSelect side={side} />
        {resourceSet?.type === 'helm' && (
          <Space wrap>
            <HelmChartSelect side={side} />
            <HelmValuesSelect side={side} />
          </Space>
        )}
        {resourceSet?.type === 'kustomize' && (
          <div style={{maxWidth: 320, minWidth: 0, width: '100%'}}>
            <KustomizeSelect side={side} />
          </div>
        )}
        {resourceSet?.type === 'cluster' && <ClusterContextSelect side={side} />}
      </MySpacer>

      <div style={{flexGrow: 0, flexShrink: 0}}>
        <Tooltip title="Reload resources" placement="bottom">
          <Button type="link" size="middle" icon={<ReloadOutlined />} onClick={handleRefresh} />
        </Tooltip>

        <Tooltip title="Clear resources" placement="bottom">
          <Button type="link" size="middle" icon={<ClearOutlined />} onClick={handleClear} />
        </Tooltip>
      </div>
    </S.ResourceSetSelectorDiv>
  );
};

function ResourceSetTypeSelect({side}: Props) {
  const dispatch = useAppDispatch();
  const resourceSet = useAppSelector(state => selectResourceSet(state.compare, side));

  const handleSelectType = useCallback(
    (type: ResourceSet['type']) => {
      dispatch(resourceSetSelected({side, value: {type}}));
    },
    [dispatch, side]
  );

  return (
    <Select onChange={handleSelectType} placeholder="Choose…" value={resourceSet?.type} style={{width: 180}}>
      <Select.Option value="local">Local</Select.Option>
      <Select.Option value="cluster">Cluster</Select.Option>
      <Select.Option value="helm">Helm Preview</Select.Option>
      <Select.Option value="kustomize">Kustomize Preview</Select.Option>
    </Select>
  );
}

function ClusterContextSelect({side}: Props) {
  const dispatch = useAppDispatch();
  const resourceSet = useAppSelector(state => selectClusterResourceSet(state, side));
  invariant(resourceSet, 'invalid_state');
  const {currentContext, allContexts} = resourceSet;

  const handleSelect = useCallback(
    (context: string) => {
      const value: PartialResourceSet = {type: 'cluster', context};
      dispatch(resourceSetSelected({side, value}));
    },
    [dispatch, side]
  );
  return (
    <Select onChange={handleSelect} placeholder="Choose context…" value={currentContext?.name} style={{width: 160}}>
      {allContexts.map(context => {
        return (
          <Select.Option key={context.name} value={context.name}>
            {context.name}
          </Select.Option>
        );
      })}
    </Select>
  );
}

function HelmChartSelect({side}: Props) {
  const dispatch = useAppDispatch();
  const resourceSet = useAppSelector(state => selectHelmResourceSet(state, side));
  invariant(resourceSet, 'invalid_state');
  const {currentHelmChart, allHelmCharts} = resourceSet;

  const handleSelect = useCallback(
    (chartId: string) => {
      const value: PartialResourceSet = {type: 'helm', chartId, valuesId: undefined};
      dispatch(resourceSetSelected({side, value}));
    },
    [dispatch, side]
  );
  return (
    <Select onChange={handleSelect} placeholder="Choose Chart…" value={currentHelmChart?.id} style={{width: 160}}>
      {allHelmCharts.map(chart => {
        return (
          <Select.Option key={chart.id} value={chart.id}>
            {chart.name}
          </Select.Option>
        );
      })}
    </Select>
  );
}

function HelmValuesSelect({side}: Props) {
  const dispatch = useAppDispatch();
  const resourceSet = useAppSelector(state => selectHelmResourceSet(state, side));
  invariant(resourceSet, 'invalid_state');
  const {currentHelmChart, currentHelmValues, availableHelmValues} = resourceSet;

  const handleSelect = useCallback(
    (valuesId: string) => {
      invariant(currentHelmChart, 'invalid_State');
      const value: PartialResourceSet = {type: 'helm', chartId: currentHelmChart.id, valuesId};
      dispatch(resourceSetSelected({side, value}));
    },
    [currentHelmChart, dispatch, side]
  );

  if (!currentHelmChart) {
    return <Select disabled placeholder="Select values…" style={{width: 160}} />;
  }

  return (
    <Select placeholder="Select values…" onSelect={handleSelect} value={currentHelmValues?.id} style={{width: 160}}>
      {availableHelmValues.map(values => {
        return (
          <Select.Option key={values.id} value={values.id}>
            {values.name}
          </Select.Option>
        );
      })}
    </Select>
  );
}

function KustomizeSelect({side}: Props) {
  const dispatch = useAppDispatch();
  const resourceSet = useAppSelector(state => selectKustomizeResourceSet(state, side));
  invariant(resourceSet, 'invalid_state');
  const {currentKustomization, allKustomizations} = resourceSet;

  const handleSelect = useCallback(
    (kustomizationId: string) => {
      const value: PartialResourceSet = {type: 'kustomize', kustomizationId};
      dispatch(resourceSetSelected({side, value}));
    },
    [dispatch, side]
  );
  return (
    <Select
      onChange={id => handleSelect(id as string)}
      placeholder="Choose Kustomization…"
      value={currentKustomization?.id}
      style={{width: '100%'}}
    >
      {allKustomizations.map(kustomization => {
        return (
          <Select.Option key={kustomization.id} value={kustomization.id}>
            {kustomization.name}
          </Select.Option>
        );
      })}
    </Select>
  );
}

const MySpacer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  flex-grow: 1;
  min-width: auto;
  overflow: hidden;
  align-items: center;

  .ant-select-selection-item {
    text-overflow: ellipsis;
  }
`;
