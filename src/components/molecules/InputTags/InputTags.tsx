import {useRef, useState} from 'react';

import {InputRef} from 'antd';

import * as S from './InputTags.styled';

interface IProps {
  tags: string[];
  onTagRemove: (tag: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const InputTags: React.FC<IProps> = ({autoFocus, disabled, placeholder, tags, onTagRemove}) => {
  const [inputValue, setInputValue] = useState('');

  const inputRef = useRef<InputRef>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && e.preventDefault();

  return (
    <S.InputTagsContainer
      $disabled={disabled}
      className={`ant-input ${disabled ? 'ant-input-disabled' : ''}`}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.length
        ? tags.map(tag => (
            <S.Tag closable={!disabled} key={tag} onClose={() => onTagRemove(tag)}>
              {tag}
            </S.Tag>
          ))
        : null}

      <S.InputContainer $width={inputValue ? inputValue.length * 8 : 75}>
        <S.Input
          autoFocus={autoFocus}
          disabled={disabled}
          placeholder={placeholder}
          bordered={false}
          ref={inputRef}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </S.InputContainer>
    </S.InputTagsContainer>
  );
};

export default InputTags;
