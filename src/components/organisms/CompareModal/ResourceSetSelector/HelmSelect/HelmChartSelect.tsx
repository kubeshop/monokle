import {useCallback} from 'react';

import {Select} from 'antd';

import invariant from 'tiny-invariant';

import {PartialResourceSet, resourceSetSelected, selectHelmResourceSet} from '@redux/compare';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import * as S from '../ResourceSetSelectColor.styled';

type Props = {
  side: 'left' | 'right';
};

export const HelmChartSelect: React.FC<Props> = ({side}) => {
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
    <S.SelectColor>
      <Select
        defaultOpen
        onChange={handleSelect}
        placeholder="Choose Chart…"
        value={currentHelmChart?.id}
        style={{width: 160}}
      >
        {allHelmCharts.map(chart => {
          return (
            <Select.Option key={chart.id} value={chart.id}>
              {chart.name}
            </Select.Option>
          );
        })}
      </Select>
    </S.SelectColor>
  );
};
