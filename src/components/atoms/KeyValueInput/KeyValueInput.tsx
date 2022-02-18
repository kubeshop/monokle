import React, {useCallback, useEffect, useState} from 'react';

import {Button} from 'antd';

import {PlusOutlined} from '@ant-design/icons';

import isDeepEqual from 'fast-deep-equal/es6/react';
import {v4 as uuidv4} from 'uuid';

import KeyValueEntryRenderer from './KeyValueEntryRenderer';
import {ANY_VALUE} from './constants';
import {KeyValueData, KeyValueEntry} from './types';

import * as S from './styled';

type KeyValueInputProps = {
  disabled?: boolean;
  label: string;
  labelStyle?: React.CSSProperties;
  schema: Record<string, string>;
  data: Record<string, string[]>;
  value: KeyValueData;
  onChange: (keyValueData: KeyValueData) => void;
};

function makeKeyValueDataFromEntries(keyValueEntries: KeyValueEntry[]): KeyValueData {
  const keyValue: KeyValueData = {};
  keyValueEntries.forEach(({key, value}) => {
    if (!key || !value) {
      return;
    }
    if (value === ANY_VALUE) {
      keyValue[key] = null;
    } else {
      keyValue[key] = value;
    }
  });
  return keyValue;
}

function KeyValueInput(props: KeyValueInputProps) {
  const {disabled = false, label, labelStyle, data, value: parentKeyValueData, schema, onChange} = props;
  const [entries, setEntries] = useState<KeyValueEntry[]>([]);
  const [currentKeyValueData, setCurrentKeyValueData] = useState<KeyValueData>(parentKeyValueData);

  useEffect(() => {
    if (!isDeepEqual(parentKeyValueData, currentKeyValueData)) {
      setCurrentKeyValueData(parentKeyValueData);
      const newEntries: KeyValueEntry[] = [];
      Object.entries(parentKeyValueData).forEach(([key, value]) => {
        if (newEntries.some(e => e.key === key)) {
          return;
        }

        if (value === null) {
          newEntries.push({
            id: uuidv4(),
            key,
            value: ANY_VALUE,
          });
        } else {
          newEntries.push({
            id: uuidv4(),
            key,
            value,
          });
        }
      });
      setEntries(newEntries);
    }
  }, [parentKeyValueData, currentKeyValueData, data]); // do we need "data" as dep?

  const updateKeyValue = (newEntries: KeyValueEntry[]) => {
    const newKeyValueData = makeKeyValueDataFromEntries(newEntries);
    setCurrentKeyValueData(newKeyValueData);
    onChange(newKeyValueData);
  };

  const createEntry = () => {
    const newEntry: KeyValueEntry = {
      id: uuidv4(),
    };
    const newEntries = [...entries, newEntry];
    setEntries(newEntries);
  };

  const removeEntry = (entryId: string) => {
    const newEntries = entries.filter(e => e.id !== entryId);
    setEntries(newEntries);
    updateKeyValue(newEntries);
  };

  const updateEntryKey = (entryId: string, key: string) => {
    const newEntries = Array.from(entries);
    const entryIndex = newEntries.findIndex(e => e.id === entryId);
    newEntries[entryIndex] = {
      id: entryId,
      key,
      value: ANY_VALUE,
    };
    setEntries(newEntries);
    updateKeyValue(newEntries);
  };

  const updateEntryValue = (entryId: string, value: string) => {
    const newEntries = Array.from(entries);
    const entryIndex = newEntries.findIndex(e => e.id === entryId);
    newEntries[entryIndex] = {
      ...newEntries[entryIndex],
      value,
    };
    setEntries(newEntries);
    updateKeyValue(newEntries);
  };

  const getEntryAvailableKeys = useCallback(
    (entry: KeyValueEntry) => {
      return Object.keys(schema).filter(key => key === entry.key || !entries.some(e => e.key === key));
    },
    [schema, entries]
  );

  const getEntryAvailableValues = useCallback(
    (entry: KeyValueEntry) => {
      if (entry.key && data[entry.key]) {
        return data[entry.key];
      }
      return undefined;
    },
    [data]
  );

  return (
    <S.Container>
      <S.TitleContainer>
        <S.TitleLabel style={labelStyle}>{label}</S.TitleLabel>
        <Button onClick={createEntry} type="link" icon={<PlusOutlined />} disabled={disabled}>
          Add
        </Button>
      </S.TitleContainer>
      {entries.map(entry => (
        <KeyValueEntryRenderer
          key={entry.id}
          entry={entry}
          valueType={entry.key ? schema[entry.key] : undefined}
          onKeyChange={newKey => updateEntryKey(entry.id, newKey)}
          onValueChange={newValue => updateEntryValue(entry.id, newValue)}
          onEntryRemove={removeEntry}
          availableKeys={getEntryAvailableKeys(entry)}
          availableValues={getEntryAvailableValues(entry)}
        />
      ))}
    </S.Container>
  );
}

export default KeyValueInput;
