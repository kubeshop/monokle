import {useEffect, useState} from 'react';

import {Select} from 'antd';

import {uniq} from 'lodash';

import {useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';

import {useTargetClusterNamespaces} from '@hooks/useTargetClusterNamespaces';

import * as S from './styled';

const Option = Select.Option;

const NEW_ITEM = 'CREATE_NEW_ITEM';
const EMPTY_VALUE = 'NONE';

export const NamespaceSelection = (params: any) => {
  const {value, onChange, disabled, readonly} = params;
  const resourceMetaMap = useResourceMetaMap('local');
  const [namespaces, setNamespaces] = useState<(string | undefined)[]>([]);
  const [inputValue, setInputValue] = useState<string>();
  const [clusterNamespaces] = useTargetClusterNamespaces();

  const handleChange = (providedValue: string) => {
    if (providedValue === NEW_ITEM) {
      onChange(inputValue);
      if (!namespaces.includes(inputValue)) {
        setNamespaces([...namespaces, inputValue]);
      }
      setInputValue('');
    }
    if (providedValue === EMPTY_VALUE) {
      onChange(undefined);
    } else {
      onChange(providedValue);
    }
  };

  useEffect(() => {
    if (resourceMetaMap) {
      const items = Object.values(resourceMetaMap)
        .map(resource => resource.namespace)
        .filter(namespace => Boolean(namespace));
      items.push(...clusterNamespaces);
      setNamespaces(uniq(items).sort());
    } else {
      setNamespaces(clusterNamespaces);
    }
  }, [resourceMetaMap, clusterNamespaces]);

  return (
    <S.SelectStyled
      value={value}
      showSearch
      optionFilterProp="children"
      onChange={handleChange}
      onSearch={(e: string) => setInputValue(e)}
      disabled={disabled || readonly}
    >
      <Option value={EMPTY_VALUE}>None</Option>
      {inputValue && namespaces.filter(namespace => namespace === inputValue).length === 0 && (
        <Option key={inputValue} value={NEW_ITEM}>
          {`Create '${inputValue}'`}
        </Option>
      )}
      {namespaces.map(namespace => (
        <Option key={namespace} value={String(namespace)}>
          {namespace}
        </Option>
      ))}
    </S.SelectStyled>
  );
};
