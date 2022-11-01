import {useEffect, useState} from 'react';

import {InputRef} from 'antd';

import {useFocus} from '@utils/hooks';

import * as S from './FilePatternListItem.styled';

type FilePatternListItemProps = {
  pattern: string;
  validateInput?: (input: string) => boolean;
  onChange: (oldPattern: string, newPattern: string) => void;
  onRemove: (pattern: string) => void;
};

const FilePatternListItem = (props: FilePatternListItemProps) => {
  const {pattern, validateInput, onChange, onRemove} = props;

  const [isEditing, setIsEditing] = useState<Boolean>(false);
  const [isHovered, setIsHovered] = useState<Boolean>(false);
  const [patternInput, setPatternInput] = useState<string>(pattern);

  const [inputRef, focusInput] = useFocus<InputRef>();

  const updatePattern = () => {
    let isPatternInputValid = true;
    if (validateInput) {
      isPatternInputValid = validateInput(patternInput);
    }
    if (isPatternInputValid) {
      onChange(pattern, patternInput);
      setIsEditing(false);
      setIsHovered(false);
    }
  };

  const onClickCancel = () => {
    setPatternInput(pattern);
    setIsEditing(false);
    setIsHovered(false);
  };

  const onClickEdit = () => {
    setPatternInput(pattern);
    setIsEditing(true);
  };

  const onClickRemove = () => {
    onRemove(pattern);
  };

  useEffect(() => {
    if (isEditing) {
      focusInput();
    }
  }, [isEditing, focusInput]);

  return (
    <li onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {isEditing ? (
        <>
          <S.InputPattern
            ref={inputRef}
            value={patternInput}
            onChange={e => setPatternInput(e.target.value)}
            onPressEnter={updatePattern}
          />
          <div>
            <S.Button onClick={updatePattern}>OK</S.Button>
            <S.Button onClick={onClickCancel}>Cancel</S.Button>
          </div>
        </>
      ) : (
        <>
          <span>{pattern}</span>
          {isHovered && (
            <>
              <S.DeleteOutlined onClick={onClickRemove} />
              <S.EditOutlined onClick={onClickEdit} />
            </>
          )}
        </>
      )}
    </li>
  );
};

export default FilePatternListItem;
