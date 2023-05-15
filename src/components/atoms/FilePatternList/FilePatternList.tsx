import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {Button, Input, InputRef, Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useAppDispatch} from '@redux/hooks';
import {setExplorerSelectedSection, setLeftMenuSelection} from '@redux/reducers/ui';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {useOnClickOutside} from '@hooks/useOnClickOutside';

import {useFocus} from '@utils/hooks';

import * as S from './FilePatternList.styled';
import FilePatternListItem from './FilePatternListItem';

type FilePatternListProps = {
  filePath: string;
  tooltip: string;
  value: string[];
  onChange: (patterns: string[]) => void;
  showApplyButton?: boolean;
  showButtonLabel?: string;
};

const FilePatternList: React.FC<FilePatternListProps> = props => {
  const {value, onChange, tooltip, showButtonLabel, showApplyButton, filePath} = props;
  const [isAddingPattern, setIsAddingPattern] = useState<Boolean>(false);
  const [patternInput, setPatternInput] = useState<string>('');
  const [inputRef, focusInput] = useFocus<InputRef>();
  const filePatternInputRef = useRef<any>();
  const isValueNotEmpty = useMemo(() => value.length > 0, [value]);

  const dispatch = useAppDispatch();

  const onApplyClick = () => {
    dispatch(setRootFolder({rootFolder: filePath}));
    dispatch(setLeftMenuSelection('explorer'));
    dispatch(setExplorerSelectedSection('files'));
  };

  useOnClickOutside(filePatternInputRef, () => {
    setIsAddingPattern(false);
    setPatternInput('');
  });

  const isPatternUnique = useCallback((patternStr: string) => !value.includes(patternStr), [value]);

  const addPattern = () => {
    if (value.includes(patternInput)) {
      return;
    }
    onChange([...value, patternInput]);
    setIsAddingPattern(false);
    setPatternInput('');
  };

  const removePattern = (pattern: string) => {
    onChange(value.filter(p => p !== pattern));
  };

  const updatePattern = (oldPattern: string, newPattern: string) => {
    const index = value.indexOf(oldPattern);
    const left = value.slice(0, index);
    const right = value.slice(index + 1);
    onChange([...left, newPattern, ...right]);
  };

  const onClickCancel = () => {
    setIsAddingPattern(false);
    setPatternInput('');
  };

  useEffect(() => {
    if (isAddingPattern) {
      focusInput();
    }
  }, [isAddingPattern, focusInput]);

  // TODO: Do we still need this?
  // useEffect(() => {
  //   if (!isSettingsOpened) {
  //     setIsAddingPattern(false);
  //     setPatternInput('');
  //   }
  // }, [isSettingsOpened]);

  return (
    <div>
      {isValueNotEmpty && (
        <S.FilePatternList>
          {value.map(pattern => (
            <FilePatternListItem
              key={pattern}
              pattern={pattern}
              validateInput={isPatternUnique}
              onChange={(oldPattern, newPattern) => updatePattern(oldPattern, newPattern)}
              onRemove={() => removePattern(pattern)}
            />
          ))}
        </S.FilePatternList>
      )}
      {isAddingPattern ? (
        <div ref={filePatternInputRef}>
          <Input
            ref={inputRef}
            defaultValue={patternInput}
            onChange={e => setPatternInput(e.target.value)}
            onPressEnter={addPattern}
          />

          <div>
            <S.Button onClick={addPattern}>OK</S.Button>
            <S.Button onClick={onClickCancel}>Cancel</S.Button>
          </div>
        </div>
      ) : (
        <>
          <Tooltip title={tooltip} mouseEnterDelay={TOOLTIP_DELAY}>
            <Button onClick={() => setIsAddingPattern(true)} style={{marginRight: 10}}>
              {showButtonLabel || 'Add Pattern'}
            </Button>
          </Tooltip>
          {showApplyButton && <Button onClick={onApplyClick}>Apply changes</Button>}
        </>
      )}
    </div>
  );
};

export default FilePatternList;
