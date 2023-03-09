import {useRef, useState} from 'react';

import {InputRef, message} from 'antd';

import * as S from './InputTags.styled';

interface IProps {
  tags: string[];
  onTagAdd: (tag: string) => void;
  onTagRemove: (tag: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  helperValue?: string;
  placeholder?: string;
  warningMessage?: string;
}

const InputTags: React.FC<IProps> = props => {
  const {autoFocus, disabled, helperValue, placeholder, tags, warningMessage} = props;
  const {onTagAdd, onTagRemove} = props;

  const [inputValue, setInputValue] = useState('');

  const inputRef = useRef<InputRef>(null);

  const addTag = () => {
    if (!inputValue) {
      return;
    }

    if (tags.includes(inputValue)) {
      message.warn(warningMessage || 'Tag already exists!');
      return;
    }

    onTagAdd(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && e.preventDefault();
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // delete last tag on backspace
    if (e.key === 'Backspace' && !inputValue && tags.length) {
      onTagRemove(tags[tags.length - 1]);
      return;
    }

    if (e.key !== 'Enter' && e.key !== ',') {
      return;
    }

    addTag();
  };

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

      <S.InputContainer $width={inputValue ? inputValue.length * 8 : 80}>
        <S.Input
          autoFocus={autoFocus}
          disabled={disabled}
          placeholder={placeholder}
          bordered={false}
          ref={inputRef}
          value={inputValue}
          onBlur={addTag}
          onChange={e => {
            if ((e.nativeEvent as InputEvent)?.data === ',') {
              return;
            }

            setInputValue(e.target.value);
          }}
          onKeyPress={handleKeyPress}
          onKeyUp={handleKeyUp}
        />
      </S.InputContainer>

      {inputValue && <S.AddTagHelper>Hit `Enter` to add {helperValue || 'tag'}</S.AddTagHelper>}
    </S.InputTagsContainer>
  );
};

export default InputTags;
