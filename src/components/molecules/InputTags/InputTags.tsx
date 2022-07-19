import {useRef, useState} from 'react';

import {InputRef} from 'antd';

import * as S from './InputTags.styled';

interface IProps {
  tags: string[];
  onClose: (tag: string) => void;
  disabled?: boolean;
}

const InputTags: React.FC<IProps> = ({disabled = false, tags, onClose}) => {
  const [inputValue, setInputValue] = useState('');

  const inputRef = useRef<InputRef>(null);

  return (
    <S.InputTagsContainer
      $disabled={disabled}
      className={`ant-input ${disabled ? 'ant-input-disabled' : ''}`}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.length
        ? tags.map(tag => (
            <S.Tag closable={!disabled} key={tag} onClose={() => onClose(tag)}>
              {tag}
            </S.Tag>
          ))
        : null}

      <S.InputContainer $width={inputValue ? inputValue.length * 8 : 75}>
        <S.Input
          disabled={disabled}
          placeholder="Enter name"
          bordered={false}
          ref={inputRef}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
        />
      </S.InputContainer>
    </S.InputTagsContainer>
  );
};

export default InputTags;
