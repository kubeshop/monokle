import {useCallback, useState} from 'react';

import {Button, Input} from 'antd';

import {CloseOutlined} from '@ant-design/icons';

import * as S from './KeyValueInput.style';

type KeyValueProps = {
  pair: [string, string];
  onChange: ([key, value]: [string, string]) => void;
  onDelete: (key: string) => void;
};

export const KeyValueInput: React.FC<KeyValueProps> = ({pair, onChange, onDelete}) => {
  const [key, setKey] = useState<string>(pair[0]);
  const [value, setValue] = useState<string>(pair[1]);

  const handleChange = useCallback(() => {
    onChange([key, value]);
  }, [onChange, key, value]);

  return (
    <S.KVDiv>
      <S.KVKey>
        <Input value={key} size="small" bordered={false} onBlur={handleChange} onChange={e => setKey(e.target.value)} />
      </S.KVKey>

      <S.KVOperation>is</S.KVOperation>

      <S.KVValue>
        <Input
          value={value}
          size="small"
          bordered={false}
          onBlur={handleChange}
          onChange={e => setValue(e.target.value)}
        />
      </S.KVValue>

      <S.KVAction>
        <Button type="link" size="small" icon={<CloseOutlined />} onClick={() => onDelete(pair[0])} />
      </S.KVAction>
    </S.KVDiv>
  );
};
