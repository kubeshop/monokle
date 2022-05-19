import {useCallback, useRef, useState} from 'react';

import {Button, Input} from 'antd';

import {PlusOutlined} from '@ant-design/icons';

import * as S from './KeyValueInput.style';

type Props = {
  onAddKeyValue: ([key, value]: [string, string]) => void;
};

export const NewKeyValueInput: React.FC<Props> = ({onAddKeyValue}) => {
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
    <S.KVDiv>
      <S.KVKey>
        <Input
          ref={keyRef}
          placeholder="Key"
          size="small"
          bordered={false}
          value={key}
          onChange={e => setKey(e.target.value)}
        />
      </S.KVKey>

      <S.KVOperation>is</S.KVOperation>

      <S.KVValue>
        <Input
          placeholder="Value"
          size="small"
          bordered={false}
          value={value}
          onKeyDown={handleEnter}
          onChange={e => setValue(e.target.value)}
        />
      </S.KVValue>

      <S.KVAction>
        <Button type="link" size="small" icon={<PlusOutlined />} onClick={handleAddKey} />
      </S.KVAction>
    </S.KVDiv>
  );
};
