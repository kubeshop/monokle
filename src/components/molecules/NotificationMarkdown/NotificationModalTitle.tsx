import {useEffect, useMemo, useState} from 'react';

import {Tooltip} from 'antd';

import {CopyOutlined, SaveOutlined} from '@ant-design/icons';

import fs from 'fs';

import FileExplorer from '@components/atoms/FileExplorer';

import {useCopyToClipboard} from '@hooks/useCopyToClipboard';
import {useFileExplorer} from '@hooks/useFileExplorer';

import * as S from './NotificationModalTitle.styled';

interface IProps {
  message: string;
  title: string;
}

const NotificationModalTitle: React.FC<IProps> = props => {
  const {message, title} = props;

  const [selectedPath, setSelectedPath] = useState('');

  const copyToClipboardMessage = useMemo(() => `Title: ${title}\nDescription: ${message}.`, [message, title]);

  const {isCopied, setCopyToClipboardState} = useCopyToClipboard(copyToClipboardMessage);

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({saveFilePath}) => {
      if (saveFilePath) {
        setSelectedPath(saveFilePath);
      }
    },
    {action: 'save'}
  );

  const onCopyToClipboard = () => {
    if (isCopied) {
      return;
    }

    setCopyToClipboardState(true);
  };

  useEffect(() => {
    if (!selectedPath) {
      return;
    }

    fs.writeFileSync(selectedPath, copyToClipboardMessage);
    setSelectedPath('');
  }, [copyToClipboardMessage, selectedPath]);

  return (
    <S.NotificationModalTitle>
      {title}

      <Tooltip title={isCopied ? 'Copied!' : 'Copy'}>
        <CopyOutlined onClick={onCopyToClipboard} />
      </Tooltip>

      <Tooltip title="Save to file">
        <SaveOutlined onClick={openFileExplorer} />
        <FileExplorer {...fileExplorerProps} />
      </Tooltip>
    </S.NotificationModalTitle>
  );
};

export default NotificationModalTitle;
