import React, {useEffect, useState} from 'react';

import {Select} from 'antd';

import {uniq} from 'lodash';

import {useAppSelector} from '@redux/hooks';
import {getK8sResources} from '@redux/services/resource';

const Option = Select.Option;

const NEW_ITEM = 'CREATE_NEW_ITEM';
const EMPTY_VALUE = 'NONE';

export const PodSelectorSelection = (params: any) => {
  const {value, onChange, disabled, readonly} = params;
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const [podSelectors, setPodSelectors] = useState<(string | undefined)[]>([]);
  const [selectValue, setSelectValue] = useState<string | undefined>();
  const [inputValue, setInputValue] = useState<string>();

  const handleChange = (providedValue: string) => {
    if (providedValue === NEW_ITEM) {
      setSelectValue(inputValue);
      if (!podSelectors.includes(inputValue)) {
        setPodSelectors([...podSelectors, inputValue]);
      }
      setInputValue('');
    } else {
      setSelectValue(providedValue);
    }
  };

  useEffect(() => {
    setInputValue('');
    if (!value) {
      setSelectValue(EMPTY_VALUE);
    } else {
      setSelectValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (selectValue === EMPTY_VALUE) {
      onChange(undefined);
    } else {
      onChange(selectValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectValue]);

  useEffect(() => {
    const labels: string[] = [];

    getK8sResources(resourceMap, 'Pod').forEach(r => {
      if (r.content?.metadata?.labels) {
        Object.keys(r.content.metadata?.labels).forEach(key =>
          labels.push(`${key}: ${r.content.metadata?.labels[key]}`)
        );
      }
    });

    Object.values(resourceMap)
      .filter(r =>
        ['DaemonSet', 'Deployment', 'Job', 'ReplicaSet', 'ReplicationController', 'StatefulSet'].includes(r.kind)
      )
      .forEach(r => {
        if (r.content?.spec?.template?.metadata?.labels) {
          Object.keys(r.content.spec?.template?.metadata?.labels).forEach(key =>
            labels.push(`${key}: ${r.content.spec?.template?.metadata?.labels[key]}`)
          );
        }
      });

    setPodSelectors(uniq(labels).sort());
  }, [resourceMap]);

  return (
    <Select
      value={selectValue}
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
    </Select>
  );
};
