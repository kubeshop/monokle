import React from 'react';

import {Select} from 'antd';

import {MinusOutlined} from '@ant-design/icons';

import Colors from '@styles/Colors';

import ValueInput from './ValueInput';
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
