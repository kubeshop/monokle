import {useEffect, useState} from 'react';
import {MonacoDiffEditor, monaco} from 'react-monaco-editor';
import {useWindowSize} from 'react-use';

import {Modal} from 'antd';

import fs from 'fs';
import {join} from 'path';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeFileCompareModal} from '@redux/reducers/ui';

import {useRefSelector} from '@utils/hooks';
import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';

import * as S from './FileCompareModal.styled';

const SIZE_PERCENTAGE = 0.92;

const options: monaco.editor.IDiffEditorConstructionOptions = {
  readOnly: true,
  renderSideBySide: true,
  inDiffEditor: true,
  renderValidationDecorations: 'off',
  minimap: {
    enabled: false,
  },
};

const FileCompareModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFilePath = useAppSelector(state => state.ui.fileCompareModal.filePath);
  const fileMapRef = useRefSelector(state => state.main.fileMap);

  const [currentFileCode, setCurrentFileCode] = useState('');
  const [comparingFilePath, setComparingFilePath] = useState('');

  const {height, width} = useWindowSize();

  useEffect(() => {
    if (!currentFilePath || !fileMapRef.current[currentFilePath]) {
      return;
    }

    const rootFilePath = fileMapRef.current?.[ROOT_FILE_ENTRY].filePath;
    if (!rootFilePath) {
      return;
    }

    const absoluteFilePath = join(rootFilePath, currentFilePath);
    setCurrentFileCode(fs.readFileSync(absoluteFilePath, 'utf-8'));
  }, [currentFilePath, fileMapRef]);

  if (!currentFilePath) {
    return null;
  }

  return (
    <Modal
      width={width * SIZE_PERCENTAGE}
      bodyStyle={{height: height * SIZE_PERCENTAGE, overflow: 'hidden'}}
      open
      onCancel={() => dispatch(closeFileCompareModal())}
      footer={null}
      centered
      title={
        <S.TitleContainer>
          <S.Title>
            Compare <S.TitleFilePath>{currentFilePath}</S.TitleFilePath>
          </S.Title>

          <div>Test</div>
        </S.TitleContainer>
      }
    >
      <MonacoDiffEditor
        height={height * SIZE_PERCENTAGE - 50}
        width={width * SIZE_PERCENTAGE - 50}
        language="yaml"
        original={currentFileCode}
        options={options}
        theme={KUBESHOP_MONACO_THEME}
      />
    </Modal>
  );
};

export default FileCompareModal;
