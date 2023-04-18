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
  const [inputValue, setInputValue] = useState<string>();

  const handleChange = (providedValue: string) => {
    if (providedValue === NEW_ITEM) {
      onChange(inputValue);
      if (!resourceNames.includes(inputValue)) {
        setResourceNames([...resourceNames, inputValue]);
      }
      setInputValue('');
    } else {
      onChange(providedValue);
    }
  };

  useEffect(() => {
    if (!value) {
      onChange(EMPTY_VALUE);
    } else {
      onChange(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (value === EMPTY_VALUE) {
      onChange(undefined);
    } else {
      onChange(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

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
      value={value}
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
