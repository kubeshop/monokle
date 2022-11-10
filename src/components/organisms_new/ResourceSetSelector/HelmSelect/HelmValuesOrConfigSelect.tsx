import {useCallback} from 'react';

import {Select} from 'antd';

import invariant from 'tiny-invariant';

import {resourceSetSelected, selectHelmResourceSet} from '@redux/compare';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {CompareSide, PartialResourceSet} from '@monokle-desktop/shared';

import * as S from '../ResourceSetSelectColor.styled';

type Props = {
  side: CompareSide;
};

export const HelmValuesOrConfigSelect: React.FC<Props> = ({side}) => {
  const dispatch = useAppDispatch();
  const resourceSet = useAppSelector(state => selectHelmResourceSet(state, side));
  invariant(resourceSet, 'invalid_state');
  const {currentHelmChart, currentHelmValuesOrConfig, availableHelmValues, availableHelmConfigs} = resourceSet;

  const options = [...availableHelmValues, ...availableHelmConfigs];

  const handleSelect = useCallback(
    (id: string) => {
      const isHelmValues = availableHelmValues.map(v => v.id).includes(id);
      invariant(currentHelmChart, 'invalid_State');

      const value: PartialResourceSet = isHelmValues
        ? {type: 'helm', chartId: currentHelmChart.id, valuesId: id}
        : {type: 'helm-custom', chartId: currentHelmChart.id, configId: id};

      dispatch(resourceSetSelected({side, value}));
    },
    [availableHelmValues, currentHelmChart, dispatch, side]
  );

  if (!currentHelmChart) {
    return <Select disabled placeholder="Select values…" style={{width: 160}} />;
  }

  return (
    <S.SelectColor>
      <Select
        defaultOpen
        placeholder="Select values…"
        onSelect={handleSelect}
        value={currentHelmValuesOrConfig?.id}
        style={{width: 160}}
      >
        {options.map(values => {
          return (
            <Select.Option key={values.id} value={values.id}>
              {values.name}
            </Select.Option>
          );
        })}
      </Select>
    </S.SelectColor>
  );
};
