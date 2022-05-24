import {useCallback} from 'react';

import {Select} from 'antd';

import invariant from 'tiny-invariant';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {PartialResourceSet, resourceSetSelected, selectHelmResourceSet} from '@redux/reducers/compare';

type Props = {
  side: 'left' | 'right';
};

export const HelmValuesSelect: React.FC<Props> = ({side}) => {
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
};
