import {useCallback, useEffect, useMemo, useState} from 'react';
import {MonacoDiffEditor, monaco} from 'react-monaco-editor';
import {useWindowSize} from 'react-use';

import {Modal, Select} from 'antd';

import fs from 'fs';
import {join, sep} from 'path';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeFileCompareModal} from '@redux/reducers/ui';

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
  const fileMap = useAppSelector(state => state.main.fileMap);

  const [currentFileCode, setCurrentFileCode] = useState('');
  const [comparingFilePath, setComparingFilePath] = useState<string>();

  const {height, width} = useWindowSize();

  const rootFilePath = useMemo(() => fileMap[ROOT_FILE_ENTRY].filePath, []);

  const comparingFileCode = useMemo(() => {
    if (!comparingFilePath || !rootFilePath) {
      return undefined;
    }

    const absoluteFilePath = join(rootFilePath, comparingFilePath);
    return fs.readFileSync(absoluteFilePath, 'utf-8');
  }, [comparingFilePath, rootFilePath]);

  const filesList: string[] = useMemo(() => {
    const files: string[] = [];

    Object.entries(fileMap).forEach(([key, value]) => {
      if (value.children || !value.isSupported || value.isExcluded) {
        return;
      }
      files.push(key.replace(sep, ''));
    });

    return files;
  }, [fileMap]);

  const renderFileSelectOptions = useCallback(() => {
    return filesList.map(fileName => (
      <Select.Option key={fileName} value={fileName}>
        {fileName}
      </Select.Option>
    ));
  }, [filesList]);

  useEffect(() => {
    if (!currentFilePath || !fileMap[currentFilePath]) {
      return;
    }

    if (!rootFilePath) {
      return;
    }

    const absoluteFilePath = join(rootFilePath, currentFilePath);
    setCurrentFileCode(fs.readFileSync(absoluteFilePath, 'utf-8'));
  }, [currentFilePath, fileMap]);

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
          <S.Title $width={(width * SIZE_PERCENTAGE - 100) / 2}>
            Compare <S.TitleFilePath>{currentFilePath}</S.TitleFilePath>
          </S.Title>

          <Select
            style={{width: '400px', justifySelf: 'flex-end'}}
            showSearch
            onChange={setComparingFilePath}
            value={comparingFilePath}
            placeholder="Select a comparing file"
          >
            {renderFileSelectOptions()}
          </Select>
        </S.TitleContainer>
      }
    >
      {comparingFileCode ? (
        <MonacoDiffEditor
          height={height * SIZE_PERCENTAGE - 50}
          width={width * SIZE_PERCENTAGE - 50}
          language="yaml"
          original={currentFileCode}
          value={comparingFileCode}
          options={options}
          theme={KUBESHOP_MONACO_THEME}
        />
      ) : null}
    </Modal>
  );
};

export default FileCompareModal;
