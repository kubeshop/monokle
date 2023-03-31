import {useMemo, useState} from 'react';
import {MonacoDiffEditor, monaco} from 'react-monaco-editor';
import {useWindowSize} from 'react-use';

import {Modal, Select} from 'antd';

import fs from 'fs';
import {join} from 'path';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeFileCompareModal} from '@redux/reducers/ui';
import {rootFilePathSelector} from '@redux/selectors';

import {SelectItemImage} from '@components/atoms';

import {useFileSelectOptions} from '@hooks/useFileSelectOptions';

import {useRefSelector} from '@utils/hooks';
import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import * as S from './FileCompareModal.styled';

const HEIGHT_SIZE_PERCENTAGE = 0.85;
const WIDTH_SIZE_PERCENTAGE = 0.92;

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
  const rootFilePath = useAppSelector(rootFilePathSelector);

  const [comparingFilePath, setComparingFilePath] = useState<string>();

  const {height, width} = useWindowSize();

  const fileSelectOptions = useFileSelectOptions();

  const comparingFileCode = useMemo(() => {
    if (!comparingFilePath || !rootFilePath) {
      return undefined;
    }

    const absoluteFilePath = join(rootFilePath, comparingFilePath);
    return fs.readFileSync(absoluteFilePath, 'utf-8');
  }, [comparingFilePath, rootFilePath]);

  const currentFileCode = useMemo(() => {
    if (!currentFilePath || !fileMapRef.current[currentFilePath] || !rootFilePath) {
      return undefined;
    }

    const absoluteFilePath = join(rootFilePath, currentFilePath);
    return fs.readFileSync(absoluteFilePath, 'utf-8');
  }, [currentFilePath, fileMapRef, rootFilePath]);

  if (!currentFilePath) {
    return null;
  }

  return (
    <Modal
      width={width * WIDTH_SIZE_PERCENTAGE}
      bodyStyle={{height: height * HEIGHT_SIZE_PERCENTAGE, overflow: 'hidden'}}
      open
      cancelButtonProps={{style: {display: 'none'}}}
      onCancel={() => dispatch(closeFileCompareModal())}
      onOk={() => dispatch(closeFileCompareModal())}
      okText="Done"
      centered
      title={
        <S.TitleContainer>
          <S.Title $width={(width * WIDTH_SIZE_PERCENTAGE - 175) / 2}>
            Compare <S.TitleFilePath>{currentFilePath}</S.TitleFilePath>
          </S.Title>
          to
          <Select
            style={{paddingLeft: '50px'}}
            showSearch
            onChange={setComparingFilePath}
            value={comparingFilePath}
            placeholder="Select comparing file"
          >
            {fileSelectOptions}
          </Select>
        </S.TitleContainer>
      }
    >
      {comparingFileCode ? (
        <MonacoDiffEditor
          height={height * HEIGHT_SIZE_PERCENTAGE - 50}
          width={width * WIDTH_SIZE_PERCENTAGE - 50}
          language="yaml"
          original={currentFileCode}
          value={comparingFileCode}
          options={options}
          theme={KUBESHOP_MONACO_THEME}
        />
      ) : (
        <SelectItemImage imageStyle={{transform: 'scaleX(-1)'}} text="Select comparing file" />
      )}
    </Modal>
  );
};

export default FileCompareModal;
