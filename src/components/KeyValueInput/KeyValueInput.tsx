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
type KeyValue = Record<string, string | null>;

type KeyValueInputProps = {
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
  const {label, labelStyle, data, value: keyValue, onChange} = props;
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
