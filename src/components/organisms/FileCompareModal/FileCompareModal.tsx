import {useEffect, useState} from 'react';
import {useWindowSize} from 'react-use';

import {Modal} from 'antd';

import fs from 'fs';
import {join} from 'path';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeFileCompareModal} from '@redux/reducers/ui';

import {useRefSelector} from '@utils/hooks';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';

const SIZE_PERCENTAGE = 0.92;

const FileCompareModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFilePath = useAppSelector(state => state.ui.fileCompareModal.filePath);
  const fileMapRef = useRefSelector(state => state.main.fileMap);

  const [currentFileCode, setCurrentFileCode] = useState('');

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
    >
      Test
    </Modal>
  );
};

export default FileCompareModal;
