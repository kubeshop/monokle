import React from 'react';

import {Input, Select} from 'antd';

import {MinusOutlined} from '@ant-design/icons';

import Colors from '@styles/Colors';

import {ANY_VALUE} from './constants';
import {KeyValueEntry} from './types';

import * as S from './styled';

type KeyValueEntryRendererProps = {
  entry: KeyValueEntry;
  valueType?: string;
  onKeyChange: (newKey: string) => void;
  onValueChange: (newValue: string) => void;
  onEntryRemove: (entryId: string) => void;
  disabled?: boolean;
  availableKeys: string[];
  availableValues?: string[];
};

type ValueInputProps = {
  value?: string;
  valueType: string;
  availableValues?: string[];
  onChange: (newValue: string) => void;
  disabled?: boolean;
};

const ValueInput: React.FC<ValueInputProps> = props => {
  const {value, valueType, availableValues, disabled, onChange} = props;

  if (valueType === 'string') {
    if (availableValues?.length) {
      return (
        <Select value={value} onChange={onChange} showSearch disabled={disabled}>
          <Select.Option key={ANY_VALUE} value={ANY_VALUE}>
            {ANY_VALUE}
          </Select.Option>
          {availableValues?.map((valueOption: string) => (
            <Select.Option key={valueOption} value={valueOption}>
              {valueOption}
            </Select.Option>
          ))}
        </Select>
      );
    }
    return <Input value={value} onChange={e => onChange(e.target.value)} disabled={disabled} />;
  }

  // TODO: decide if we want to implement more value types
  return null;
};

const KeyValueEntryRenderer: React.FC<KeyValueEntryRendererProps> = props => {
  const {entry, valueType, onKeyChange, onValueChange, onEntryRemove, disabled, availableKeys, availableValues} = props;

  return (
    <S.KeyValueRemoveButtonContainer key={entry.id}>
      <S.KeyValueContainer>
        <Select value={entry.key} onChange={onKeyChange} showSearch disabled={disabled}>
          {availableKeys.map(key => (
            <Select.Option key={key} value={key}>
              {key}
            </Select.Option>
          ))}
        </Select>

        {entry.key && valueType && valueType !== 'boolean' && (
          <ValueInput
            value={entry.value}
            valueType={valueType}
            availableValues={availableValues}
            onChange={onValueChange}
          />
        )}
      </S.KeyValueContainer>

      <S.StyledRemoveButton
        disabled={disabled}
        onClick={() => onEntryRemove(entry.id)}
        color={Colors.redError}
        size="small"
        icon={<MinusOutlined />}
      />
    </S.KeyValueRemoveButtonContainer>
  );
};

export default KeyValueEntryRenderer;
