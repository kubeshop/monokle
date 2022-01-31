import React, {useEffect, useState} from 'react';

import {Select} from 'antd';

import {uniq} from 'lodash';

import {ResourceKindHandlers} from '@src/kindhandlers';

const Option = Select.Option;

const NEW_ITEM = 'CREATE_NEW_ITEM';
const EMPTY_VALUE = 'NONE';

export const ApiGroupSelection = (params: any) => {
  const {value, onChange, disabled, readonly} = params;
  const [apiGroups, setApiGroups] = useState<(string | undefined)[]>([]);
  const [selectValue, setSelectValue] = useState<string | undefined>();
  const [inputValue, setInputValue] = useState<string>();

  const handleChange = (providedValue: string) => {
    if (providedValue === NEW_ITEM) {
      setSelectValue(inputValue);
      if (!apiGroups.includes(inputValue)) {
        setApiGroups([...apiGroups, inputValue]);
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
    setApiGroups(
      uniq(
        ResourceKindHandlers.map(handler =>
          handler.clusterApiVersion.includes('/')
            ? handler.clusterApiVersion.substring(0, handler.clusterApiVersion.indexOf('/'))
            : handler.clusterApiVersion
        )
      ).sort()
    );
  }, []);

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
      {inputValue && apiGroups.filter(apiGroup => apiGroup === inputValue).length === 0 && (
        <Option key={inputValue} value={NEW_ITEM}>
          {`unknown apiGroup '${inputValue}'`}
        </Option>
      )}
      {apiGroups.map(apiGroup => (
        <Option key={apiGroup} value={String(apiGroup)}>
          {apiGroup}
        </Option>
      ))}
    </Select>
  );
};
