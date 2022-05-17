import {useCallback} from 'react';

import {Button, Select, Tooltip} from 'antd';

import {ClearOutlined, ReloadOutlined} from '@ant-design/icons';

import invariant from 'tiny-invariant';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  PartialResourceSet,
  ResourceSet,
  resourceSetCleared,
  resourceSetRefreshed,
  resourceSetSelected,
  selectHelmResourceSet,
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
      <div>
        <ResourceSetTypeSelect side={side} />
        {resourceSet?.type === 'helm' && <HelmChartSelect side={side} />}
        {resourceSet?.type === 'helm' && <HelmValuesSelect side={side} />}
      </div>

      <div>
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
      if (type === 'cluster') {
        dispatch(resourceSetSelected({side, value: {type: 'cluster', context: 'some-context'}}));
      } else {
        dispatch(resourceSetSelected({side, value: {type}}));
      }
    },
    [dispatch, side]
  );

  return (
    <Select onChange={handleSelectType} placeholder="Choose…" value={resourceSet?.type} style={{width: 180}}>
      <Select.Option value="local">Local</Select.Option>
      <Select.Option value="cluster">Cluster</Select.Option>
      <Select.Option value="helm">Helm Preview</Select.Option>
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
    <Select onChange={handleSelect} placeholder="Choose Chart…" value={currentHelmChart?.id} style={{width: 180}}>
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
    return <Select disabled placeholder="Select values…" />;
  }

  return (
    <Select placeholder="Select values…" onSelect={handleSelect} value={currentHelmValues?.id} style={{width: 180}}>
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
