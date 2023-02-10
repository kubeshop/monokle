import React, {useEffect, useState} from 'react';

import {Select} from 'antd';

import {uniq} from 'lodash';

import {useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';

import * as S from './styled';

const Option = Select.Option;

const NEW_ITEM = 'CREATE_NEW_ITEM';
const EMPTY_VALUE = '- none -';

ResourceSelection.defaultProps = {
  options: {},
};

export function ResourceSelection(props: any) {
  const {value, onChange, disabled, options, readonly} = props;
  const resourceMetaMap = useResourceMetaMap('local');
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
    if (resourceMetaMap) {
      const resourceKinds: string[] | undefined = options?.resourceKinds ? options.resourceKinds.split('|') : undefined;
      setResourceNames(
        uniq(
          Object.values(resourceMetaMap)
            .filter(resource => !resourceKinds || resourceKinds.includes(resource.kind))
            .map(resource => resource.name)
        ).sort()
      );
    } else {
      setResourceNames([]);
    }
  }, [resourceMetaMap, options.resourceKinds]);

  return (
    <S.SelectStyled
      value={selectValue}
      showSearch
      onSearch={(e: string) => setInputValue(e)}
      optionFilterProp="children"
      onChange={handleChange}
      disabled={disabled || readonly}
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
    </S.SelectStyled>
  );
}
