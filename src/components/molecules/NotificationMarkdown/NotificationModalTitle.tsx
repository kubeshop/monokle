import {useMemo} from 'react';

import {Tooltip} from 'antd';

import {CopyOutlined} from '@ant-design/icons';

import {useCopyToClipboard} from '@hooks/useCopyToClipboard';

import * as S from './NotificationModalTitle.styled';

interface IProps {
  message: string;
  title: string;
}

const NotificationModalTitle: React.FC<IProps> = props => {
  const {message, title} = props;

  const copyToClipboardMessage = useMemo(() => `Title: ${title}. Description: ${message}.`, [message, title]);
  const {isCopied, setCopyToClipboardState} = useCopyToClipboard(copyToClipboardMessage);

  const onCopyToClipboard = () => {
    if (isCopied) {
      return;
    }

    setCopyToClipboardState(true);
  };

  return (
    <S.NotificationModalTitle>
      {title}
      <Tooltip title={isCopied ? 'Copied!' : 'Copy'}>
        <CopyOutlined onClick={onCopyToClipboard} />
      </Tooltip>
    </S.NotificationModalTitle>
  );
};

export default NotificationModalTitle;
