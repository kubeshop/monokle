import {useCallback, useRef, useState} from 'react';

import {Button, Input} from 'antd';

import {CloseOutlined, PlusOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const KVDiv = styled.div`
  display: flex;
  border: solid ${Colors.grey5b} 1px;
  border-radius: 4px;
`;

export const KVKey = styled.div``;

export const KVValue = styled.div``;

export const KVOperation = styled.div`
  border-left: solid ${Colors.grey5b} 1px;
  border-right: solid ${Colors.grey5b} 1px;
  color: ${Colors.grey7};
  padding: 0 4px;
`;

export const KVAction = styled.div`
  border-left: solid ${Colors.grey5b} 1px;
`;

type Props = {
  onAddKeyValue: ([key, value]: [string, string]) => void;
};

export const NewKeyValue: React.FC<Props> = ({onAddKeyValue}) => {
  const [key, setKey] = useState<string | undefined>();
  const [value, setValue] = useState<string | undefined>();
  const keyRef = useRef<Input | null>(null);

  const handleAddKey = useCallback(() => {
    if (!key || !value) return;
    onAddKeyValue([key, value]);
    setKey(undefined);
    setValue(undefined);
    keyRef.current?.input.focus();
  }, [key, onAddKeyValue, value]);

  const handleEnter = useCallback(
    (e: any) => {
      if (e?.key !== 'Enter') return;
      handleAddKey();
    },
    [handleAddKey]
  );

  return (
    <KVDiv>
      <KVKey>
        <Input
          ref={keyRef}
          placeholder="Key"
          size="small"
          bordered={false}
          value={key}
          onChange={e => setKey(e.target.value)}
        />
      </KVKey>

      <KVOperation>is</KVOperation>

      <KVValue>
        <Input
          placeholder="Value"
          size="small"
          bordered={false}
          value={value}
          onKeyDown={handleEnter}
          onChange={e => setValue(e.target.value)}
        />
      </KVValue>

      <KVAction>
        <Button type="link" size="small" icon={<PlusOutlined />} onClick={handleAddKey} />
      </KVAction>
    </KVDiv>
  );
};

type KeyValueProps = {
  pair: [string, string];
  onChange: ([key, value]: [string, string]) => void;
  onDelete: (key: string) => void;
};

export const KeyValue: React.FC<KeyValueProps> = ({pair, onChange, onDelete}) => {
  const [key, setKey] = useState<string>(pair[0]);
  const [value, setValue] = useState<string>(pair[1]);

  const handleChange = useCallback(() => {
    onChange([key, value]);
  }, [onChange, key, value]);

  return (
    <KVDiv>
      <KVKey>
        <Input value={key} size="small" bordered={false} onBlur={handleChange} onChange={e => setKey(e.target.value)} />
      </KVKey>

      <KVOperation>is</KVOperation>

      <KVValue>
        <Input
          value={value}
          size="small"
          bordered={false}
          onBlur={handleChange}
          onChange={e => setValue(e.target.value)}
        />
      </KVValue>

      <KVAction>
        <Button type="link" size="small" icon={<CloseOutlined />} onClick={() => onDelete(pair[0])} />
      </KVAction>
    </KVDiv>
  );
};
