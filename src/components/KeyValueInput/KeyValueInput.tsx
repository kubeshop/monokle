import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import isDeepEqual from 'fast-deep-equal/es6/react';
import {Select, Button} from 'antd';
import {PlusOutlined, MinusOutlined} from '@ant-design/icons';
import {v4 as uuidv4} from 'uuid';
import Colors from '@styles/Colors';

const Container = styled.div`
  min-width: 600px;
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
  display: flex;
  align-items: center;
  margin: 10px 0;
`;

const StyledRemoveButton = styled(Button)`
  margin-left: 8px;
  min-width: 24px;
`;

type KeyValueEntry = {id: string; key?: string; value?: string};
type KeyValues = Record<string, string[]>;

type KeyValueInputProps = {
  label: string;
  labelStyle?: React.CSSProperties;
  data: KeyValues;
  value: KeyValues;
  onChange: (keyValues: KeyValues) => void;
};

export const ANY_VALUE = '<any>';

function concatValuesOfSimilarKeys(keyValueEntries: KeyValueEntry[]): KeyValues {
  const keyValues: KeyValues = {};
  keyValueEntries.forEach(({key, value}) => {
    if (!key || !value) {
      return;
    }
    if (keyValues[key]) {
      keyValues[key].push(value);
    } else {
      keyValues[key] = [value];
    }
  });
  return Object.fromEntries(
    Object.entries(keyValues).map(([key, values]) => [key, values.some(val => val === ANY_VALUE) ? [] : values])
  );
}

function KeyValueInput(props: KeyValueInputProps) {
  const {label, labelStyle, data, value: keyValues, onChange} = props;
  const [entries, setEntries] = useState<KeyValueEntry[]>([]);
  const [currentKeyValues, setCurrentKeyValues] = useState<KeyValues>(keyValues);

  useEffect(() => {
    if (!isDeepEqual(keyValues, currentKeyValues)) {
      setCurrentKeyValues(keyValues);
      const newEntries: KeyValueEntry[] = [];
      Object.entries(keyValues).forEach(([key, values]) => {
        if (data[key]) {
          if (values.length === 0) {
            newEntries.push({
              id: uuidv4(),
              key,
              value: ANY_VALUE,
            });
          } else {
            newEntries.push(
              ...values
                .filter(value => data[key].includes(value))
                .map(value => {
                  return {
                    id: uuidv4(),
                    key,
                    value,
                  };
                })
            );
          }
        }
      });
      setEntries(newEntries);
    }
  }, [keyValues, currentKeyValues, data]);

  const updateKeyValues = (newEntries: KeyValueEntry[]) => {
    const newKeyValues = concatValuesOfSimilarKeys(newEntries);
    setCurrentKeyValues(newKeyValues);
    onChange(newKeyValues);
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
    updateKeyValues(newEntries);
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
    updateKeyValues(newEntries);
  };

  const updateEntryValue = (entryId: string, value: string) => {
    const newEntries = Array.from(entries);
    const entryIndex = newEntries.findIndex(e => e.id === entryId);
    newEntries[entryIndex] = {
      ...newEntries[entryIndex],
      value,
    };
    setEntries(newEntries);
    updateKeyValues(newEntries);
  };

  return (
    <Container>
      <TitleContainer>
        <TitleLabel style={labelStyle}>{label}</TitleLabel>
        <Button onClick={createEntry} type="link" icon={<PlusOutlined />}>
          Add
        </Button>
      </TitleContainer>
      {entries.map(entry => (
        <KeyValueContainer key={entry.id}>
          <Select
            value={entry.key}
            onChange={newKey => updateEntryKey(entry.id, newKey)}
            style={{width: '100%'}}
            showSearch
          >
            {Object.keys(data).map(key => (
              <Select.Option key={key} value={key}>
                {key}
              </Select.Option>
            ))}
          </Select>
          {entry.key && (
            <Select
              value={entry.value}
              onChange={newValue => updateEntryValue(entry.id, newValue)}
              style={{width: '100%', marginLeft: 8}}
              showSearch
            >
              <Select.Option key={ANY_VALUE} value={ANY_VALUE}>
                {ANY_VALUE}
              </Select.Option>
              {data[entry.key].map((value: string) => (
                <Select.Option key={value} value={value}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          )}
          <StyledRemoveButton
            onClick={() => removeEntry(entry.id)}
            color={Colors.redError}
            size="small"
            icon={<MinusOutlined />}
          />
        </KeyValueContainer>
      ))}
    </Container>
  );
}

export default KeyValueInput;
