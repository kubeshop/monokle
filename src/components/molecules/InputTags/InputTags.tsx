import {useRef, useState} from 'react';

import {InputRef} from 'antd';

import * as S from './InputTags.styled';

interface IProps {
  tags: string[];
}

const InputTags: React.FC<IProps> = ({tags}) => {
  const [inputValue, setInputValue] = useState('');

  const inputRef = useRef<InputRef>(null);

  return (
    <S.InputTagsContainer className="ant-input" onClick={() => inputRef.current?.focus()}>
      {tags.length &&
        tags.map(tag => (
          <S.Tag closable key={tag}>
            {tag}
          </S.Tag>
        ))}

      <S.InputContainer $width={inputValue ? inputValue.length * 8 : 4}>
        <S.Input bordered={false} ref={inputRef} value={inputValue} onChange={e => setInputValue(e.target.value)} />
      </S.InputContainer>
    </S.InputTagsContainer>
  );
};

export default InputTags;
