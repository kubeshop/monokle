import {useEffect, useState} from 'react';

import {Select} from 'antd';

import {uniq} from 'lodash';

import {useResourceContentMap} from '@redux/selectors/resourceMapSelectors';

import * as S from './styled';

const Option = Select.Option;

const NEW_ITEM = 'CREATE_NEW_ITEM';
const EMPTY_VALUE = 'NONE';

export const PodSelectorSelection = (params: any) => {
  const {value, onChange, disabled, readonly} = params;
  const resourceContentMap = useResourceContentMap('local');
  const [podSelectors, setPodSelectors] = useState<(string | undefined)[]>([]);
  const [inputValue, setInputValue] = useState<string>();

  const handleChange = (providedValue: string) => {
    if (providedValue === NEW_ITEM) {
      onChange(inputValue);
      if (!podSelectors.includes(inputValue)) {
        setPodSelectors([...podSelectors, inputValue]);
      }
      setInputValue('');
    } else {
      onChange(providedValue);
    }
  };

  useEffect(() => {
    setInputValue('');
    if (!value) {
      onChange(undefined);
    } else {
      onChange(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const labels: string[] = [];

    Object.values(resourceContentMap)
      .filter(r => r.object?.kind === 'Pod')
      .forEach(r => {
        if (r.object?.metadata?.labels) {
          Object.keys(r.object.metadata?.labels).forEach(key =>
            labels.push(`${key}: ${r.object.metadata?.labels[key]}`)
          );
        }
      });

    Object.values(resourceContentMap)
      .filter(r =>
        ['DaemonSet', 'Deployment', 'Job', 'ReplicaSet', 'ReplicationController', 'StatefulSet'].includes(
          r.object?.kind
        )
      )
      .forEach(r => {
        if (r.object?.spec?.template?.metadata?.labels) {
          Object.keys(r.object.spec?.template?.metadata?.labels).forEach(key =>
            labels.push(`${key}: ${r.object.spec?.template?.metadata?.labels[key]}`)
          );
        }
      });

    setPodSelectors(uniq(labels).sort());
  }, [resourceContentMap]);

  return (
    <S.SelectStyled
      value={value || EMPTY_VALUE}
      showSearch
      optionFilterProp="children"
      onChange={handleChange}
      onSearch={(e: string) => setInputValue(e)}
      disabled={disabled || readonly}
    >
      <Option value={EMPTY_VALUE}>None</Option>
      {inputValue && podSelectors.filter(selector => selector === inputValue).length === 0 && (
        <Option key={inputValue} value={NEW_ITEM}>
          {`unknown podSelector '${inputValue}'`}
        </Option>
      )}
      {podSelectors.map(apiGroup => (
        <Option key={apiGroup} value={String(apiGroup)}>
          {apiGroup}
        </Option>
      ))}
    </S.SelectStyled>
  );
};
