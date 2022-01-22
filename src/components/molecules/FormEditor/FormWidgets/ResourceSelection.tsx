import React, {useEffect, useState} from 'react';

import {Select} from 'antd';

import {uniq} from 'lodash';

import {K8sResource} from '@models/k8sresource';

import {useAppSelector} from '@redux/hooks';

const Option = Select.Option;

const NEW_ITEM = 'CREATE_NEW_ITEM';
const EMPTY_VALUE = '- none -';

ResourceSelection.defaultProps = {
  options: {},
};

export function ResourceSelection(props: any) {
  const {value, onChange, disabled, options} = props;
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const [resourceNames, setResourceNames] = useState<(string | undefined)[]>([]);
  const [selectValue, setSelectValue] = useState<string | undefined>();
  const [inputValue, setInputValue] = useState<string>();

  const handleChange = (providedValue: string) => {
    if (providedValue === NEW_ITEM) {
      setSelectValue(inputValue);
      if (!resourceNames.includes(inputValue)) {
        setResourceNames([...resourceNames, inputValue]);
      }
      setInputValue('');
    } else {
      setSelectValue(providedValue);
    }
  };

  useEffect(() => {
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
    if (resourceMap) {
      const resourceKinds: string[] | undefined = options?.resourceKinds ? options.resourceKinds.split('|') : undefined;
      setResourceNames(
        uniq(
          Object.values(resourceMap)
            .filter(resource => !resourceKinds || resourceKinds.includes(resource.kind))
            .map((resource: K8sResource) => resource.name)
        ).sort()
      );
    } else {
      setResourceNames([]);
    }
  }, [resourceMap]);

  return (
    <Select
      value={selectValue}
      showSearch
      onSearch={(e: string) => setInputValue(e)}
      optionFilterProp="children"
      onChange={handleChange}
      disabled={disabled}
    >
      <Option value={EMPTY_VALUE}>{EMPTY_VALUE}</Option>
      {inputValue && !resourceNames.some(name => name === inputValue) && (
        <Option key={inputValue} value={NEW_ITEM}>
          {`Unknown resource '${inputValue}'`}
        </Option>
      )}
      {resourceNames.map(name => (
        <Option key={name} value={String(name)}>
          {name}
        </Option>
      ))}
    </Select>
  );
}
