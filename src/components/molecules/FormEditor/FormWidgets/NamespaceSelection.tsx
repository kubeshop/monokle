import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {Select} from 'antd';

import {uniq} from 'lodash';

import {K8sResource} from '@models/k8sresource';

import {useAppSelector} from '@redux/hooks';
import {selectedResourceSelector} from '@redux/selectors';

import {useTargetClusterNamespaces} from '@hooks/useTargetClusterNamespaces';

const Option = Select.Option;

const NEW_ITEM = 'CREATE_NEW_ITEM';
const EMPTY_VALUE = 'NONE';

export const NamespaceSelection = (params: any) => {
  const {value, onChange, disabled, readonly} = params;
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResource = useSelector(selectedResourceSelector);
  const [namespaces, setNamespaces] = useState<(string | undefined)[]>([]);
  const [selectValue, setSelectValue] = useState<string | undefined>();
  const [inputValue, setInputValue] = useState<string>();
  const [clusterNamespaces] = useTargetClusterNamespaces();

  const handleChange = (providedValue: string) => {
    if (providedValue === NEW_ITEM) {
      setSelectValue(inputValue);
      if (!namespaces.includes(inputValue)) {
        setNamespaces([...namespaces, inputValue]);
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
  }, [selectedResource, value]);

  useEffect(() => {
    if (selectValue === EMPTY_VALUE) {
      onChange(undefined);
    } else {
      onChange(selectValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectValue]);

  useEffect(() => {
    if (resourceMap) {
      const items = Object.values(resourceMap)
        .map((resource: K8sResource) => resource.namespace)
        .filter(namespace => Boolean(namespace));
      items.push(...clusterNamespaces);
      setNamespaces(uniq(items).sort());
    } else {
      setNamespaces(clusterNamespaces);
    }
  }, [resourceMap, clusterNamespaces]);

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
      {inputValue && namespaces.filter(namespace => namespace === inputValue).length === 0 && (
        <Option key={inputValue} value={NEW_ITEM}>
          {`create '${inputValue}'`}
        </Option>
      )}
      {namespaces.map(namespace => (
        <Option key={namespace} value={String(namespace)}>
          {namespace}
        </Option>
      ))}
    </Select>
  );
};
