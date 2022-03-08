import {useEffect, useState} from 'react';

import {Button, Input} from 'antd';

import {DeleteOutlined, EditOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useFocus} from '@utils/hooks';

type FilePatternListItemProps = {
  pattern: string;
  validateInput?: (input: string) => boolean;
  onChange: (oldPattern: string, newPattern: string) => void;
  onRemove: (pattern: string) => void;
};

const StyledEditOutlined = styled(EditOutlined)`
  float: right;
`;

const StyledDeleteOutlined = styled(DeleteOutlined)`
  margin-left: 5px;
  float: right;
`;

const StyledButton = styled(Button)`
  margin-top: 10px;
  margin-right: 5px;
  margin-bottom: 10px;
`;

const StyledInputPattern = styled(Input)`
  margin-top: 5px;
`;

const FilePatternListItem = (props: FilePatternListItemProps) => {
  const {pattern, validateInput, onChange, onRemove} = props;

  const [isEditing, setIsEditing] = useState<Boolean>(false);
  const [isHovered, setIsHovered] = useState<Boolean>(false);
  const [patternInput, setPatternInput] = useState<string>(pattern);

  const [inputRef, focusInput] = useFocus<Input>();

  useEffect(() => {
    if (isEditing) {
      focusInput();
    }
  }, [isEditing, focusInput]);

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

  return (
    <li onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {isEditing ? (
        <>
          <StyledInputPattern
            ref={inputRef}
            value={patternInput}
            onChange={e => setPatternInput(e.target.value)}
            onPressEnter={updatePattern}
          />
          <div>
            <StyledButton onClick={updatePattern}>OK</StyledButton>
            <StyledButton onClick={onClickCancel}>Cancel</StyledButton>
          </div>
        </>
      ) : (
        <>
          <span>{pattern}</span>
          {isHovered && (
            <>
              <StyledDeleteOutlined onClick={onClickRemove} />
              <StyledEditOutlined onClick={onClickEdit} />
            </>
          )}
        </>
      )}
    </li>
  );
};

export default FilePatternListItem;
