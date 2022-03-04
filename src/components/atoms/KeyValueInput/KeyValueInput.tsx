import React, {useCallback, useEffect, useState} from 'react';

import {Button} from 'antd';

import {PlusOutlined} from '@ant-design/icons';

import isDeepEqual from 'fast-deep-equal/es6/react';
import {v4 as uuidv4} from 'uuid';

import {openUrlInExternalBrowser} from '@utils/shell';

import KeyValueEntryRenderer from './KeyValueEntryRenderer';
import {ANY_VALUE} from './constants';
import {KeyValueData, KeyValueEntry} from './types';

import * as S from './styled';

type KeyValueInputProps = {
  disabled?: boolean;
  label: string;
  labelStyle?: React.CSSProperties;
  schema: Record<string, string>;
  availableValuesByKey: Record<string, string[]>;
  value: KeyValueData;
  docsUrl?: string;
  onChange: (keyValueData: KeyValueData) => void;
};

function makeKeyValueDataFromEntries(keyValueEntries: KeyValueEntry[]): KeyValueData {
  const keyValue: KeyValueData = {};
  keyValueEntries.forEach(({key, value}) => {
    if (!key) {
      return;
    }
    if (value === ANY_VALUE || value === undefined) {
      keyValue[key] = null;
    } else {
      keyValue[key] = value;
    }
  });
  return keyValue;
}

function createEntriesFromParentKeyValueData(
  parentKeyValueData: KeyValueData,
  availableValuesByKey: Record<string, string[]>
): KeyValueEntry[] {
  const newEntries: KeyValueEntry[] = [];
  Object.entries(parentKeyValueData).forEach(([key, value]) => {
    if (newEntries.some(e => e.key === key)) {
      return;
    }

    const availableValues: string[] | undefined = availableValuesByKey[key];

    if (value === null) {
      newEntries.push({
        id: uuidv4(),
        key,
        value: availableValues?.length ? ANY_VALUE : undefined,
      });
    } else {
      newEntries.push({
        id: uuidv4(),
        key,
        value,
      });
    }
  });
  return newEntries;
}

function KeyValueInput(props: KeyValueInputProps) {
  const {
    disabled = false,
    label,
    labelStyle,
    availableValuesByKey,
    value: parentKeyValueData,
    schema,
    docsUrl,
    onChange,
  } = props;
  const [currentKeyValueData, setCurrentKeyValueData] = useState<KeyValueData>(parentKeyValueData);
  const [entries, setEntries] = useState<KeyValueEntry[]>(
    createEntriesFromParentKeyValueData(parentKeyValueData, availableValuesByKey)
  );

  useEffect(() => {
    if (!isDeepEqual(parentKeyValueData, currentKeyValueData)) {
      setCurrentKeyValueData(parentKeyValueData);
      const newEntries = createEntriesFromParentKeyValueData(parentKeyValueData, availableValuesByKey);
      setEntries(newEntries);
    }
  }, [parentKeyValueData, currentKeyValueData, availableValuesByKey]);

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
    updateKeyValue(newEntries);
  };

  const removeEntry = (entryId: string) => {
    const newEntries = entries.filter(e => e.id !== entryId);
    setEntries(newEntries);
    updateKeyValue(newEntries);
  };

  const updateEntryKey = (entryId: string, key: string) => {
    const newEntries = Array.from(entries);
    const entryIndex = newEntries.findIndex(e => e.id === entryId);

    const availableValues: string[] | undefined = availableValuesByKey[key];

    newEntries[entryIndex] = {
      id: entryId,
      key,
      value: availableValues?.length ? ANY_VALUE : undefined,
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
      if (entry.key && availableValuesByKey[entry.key]) {
        return availableValuesByKey[entry.key];
      }
      return undefined;
    },
    [availableValuesByKey]
  );

  return (
    <S.Container>
      <S.TitleContainer>
        <S.TitleLabel style={labelStyle}>{label}</S.TitleLabel>
        {docsUrl && (
          <Button type="link" onClick={() => openUrlInExternalBrowser(docsUrl)} style={{padding: 0}}>
            Documentation
          </Button>
        )}
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
      <Button onClick={createEntry} type="link" icon={<PlusOutlined />} disabled={disabled} style={{paddingLeft: 0}}>
        Add
      </Button>
    </S.Container>
  );
}

export default KeyValueInput;
