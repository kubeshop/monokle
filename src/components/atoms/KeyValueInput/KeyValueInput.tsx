import React, {useEffect, useState} from 'react';

import {Button, Select} from 'antd';

import {MinusOutlined, PlusOutlined} from '@ant-design/icons';

import isDeepEqual from 'fast-deep-equal/es6/react';
import styled from 'styled-components';
import {v4 as uuidv4} from 'uuid';

import Colors from '@styles/Colors';

const Container = styled.div`
  max-height: 800px;
  overflow-y: auto;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const TitleLabel = styled.span``;

const KeyValueContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-gap: 8px;
  align-items: center;
  margin: 10px 0;
`;

const KeyValueRemoveButtonContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr max-content;
  grid-gap: 8px;
  align-items: center;
`;

const StyledRemoveButton = styled(Button)`
  min-width: 24px;
`;

type KeyValueEntry = {id: string; key?: string; value?: string};
type KeyValue = Record<string, string | null>;

type KeyValueInputProps = {
  disabled?: boolean;
  label: string;
  labelStyle?: React.CSSProperties;
  data: Record<string, string[]>;
  value: KeyValue;
  onChange: (keyValues: KeyValue) => void;
};

export const ANY_VALUE = '<any>';

function makeKeyValueFromEntries(keyValueEntries: KeyValueEntry[]): KeyValue {
  const keyValue: KeyValue = {};
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
  const {disabled = false, label, labelStyle, data, value: keyValue, onChange} = props;
  const [entries, setEntries] = useState<KeyValueEntry[]>([]);
  const [currentKeyValue, setCurrentKeyValue] = useState<KeyValue>(keyValue);

  useEffect(() => {
    if (!isDeepEqual(keyValue, currentKeyValue)) {
      setCurrentKeyValue(keyValue);
      const newEntries: KeyValueEntry[] = [];
      Object.entries(keyValue).forEach(([key, value]) => {
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
  }, [keyValue, currentKeyValue, data]);

  const updateKeyValue = (newEntries: KeyValueEntry[]) => {
    const newKeyValue = makeKeyValueFromEntries(newEntries);
    setCurrentKeyValue(newKeyValue);
    onChange(newKeyValue);
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

  return (
    <Container>
      <TitleContainer>
        <TitleLabel style={labelStyle}>{label}</TitleLabel>
        <Button onClick={createEntry} type="link" icon={<PlusOutlined />} disabled={disabled}>
          Add
        </Button>
      </TitleContainer>
      {entries.map(entry => (
        <KeyValueRemoveButtonContainer key={entry.id}>
          <KeyValueContainer>
            <Select
              value={entry.key}
              onChange={newKey => updateEntryKey(entry.id, newKey)}
              showSearch
              disabled={disabled}
            >
              {Object.keys(data)
                .filter(key => key === entry.key || !entries.some(e => e.key === key))
                .map(key => (
                  <Select.Option key={key} value={key}>
                    {key}
                  </Select.Option>
                ))}
            </Select>

            {entry.key && (
              <Select
                value={entry.value}
                onChange={newValue => updateEntryValue(entry.id, newValue)}
                showSearch
                disabled={disabled}
              >
                <Select.Option key={ANY_VALUE} value={ANY_VALUE}>
                  {ANY_VALUE}
                </Select.Option>
                {data[entry.key] &&
                  data[entry.key].map((value: string) => (
                    <Select.Option key={value} value={value}>
                      {value}
                    </Select.Option>
                  ))}
              </Select>
            )}
          </KeyValueContainer>

          <StyledRemoveButton
            disabled={disabled}
            onClick={() => removeEntry(entry.id)}
            color={Colors.redError}
            size="small"
            icon={<MinusOutlined />}
          />
        </KeyValueRemoveButtonContainer>
      ))}
    </Container>
  );
}

export default KeyValueInput;
