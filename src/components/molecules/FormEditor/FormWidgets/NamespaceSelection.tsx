import React, {useEffect, useState} from 'react';

import {Select} from 'antd';

import {K8sResource} from '@models/k8sresource';

import {useAppSelector} from '@redux/hooks';

const Option = Select.Option;

const NEW_ITEM = 'CREATE_NEW_ITEM';

export const NamespaceSelection = ({value, onChange}: any) => {
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const [namespaces, setNamespaces] = useState<(string | undefined)[]>([]);
  const [selectValue, setSelectValue] = useState<string | undefined>(value);
  const [inputValue, setInputValue] = useState<string>();

  const handleChange = (providedValue: string) => {
    if (providedValue === NEW_ITEM) {
      setSelectValue(inputValue);
      setNamespaces([...namespaces, inputValue]);
      setSelectValue(inputValue);
      setInputValue('');
    } else {
      setSelectValue(providedValue);
    }
  };

  useEffect(() => {
    onChange(selectValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectValue]);

  useEffect(() => {
    if (resourceMap) {
      setNamespaces(
        Object.values(resourceMap)
          .map((resource: K8sResource) => resource.namespace)
          .filter(namespace => namespace && namespace !== 'default')
      );
    } else {
      setNamespaces([]);
    }
  }, [resourceMap]);

  return (
    <Select
      value={selectValue}
      showSearch
      optionFilterProp="children"
      onChange={handleChange}
      onSearch={(e: string) => {
        setInputValue(e);
      }}
    >
      <Option value="default">default</Option>
      {inputValue && namespaces.filter(namespace => namespace === inputValue).length === 0 && (
        <Option key={inputValue} value={NEW_ITEM}>
          create {inputValue}
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
