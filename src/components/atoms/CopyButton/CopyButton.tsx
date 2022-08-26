import {useCallback, useState} from 'react';
import {useInterval} from 'react-use';

import {Button} from 'antd';

import {CopyOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

function CopyButton({content}: {content: string}) {
  const [isCopiedRecently, setIsCopiedRecently] = useState(false);

  useInterval(
    () => {
      setIsCopiedRecently(false);
    },
    isCopiedRecently ? 1500 : null
  );

  const handleCopy = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(content);
      setIsCopiedRecently(true);
    },
    [setIsCopiedRecently, content]
  );

  return (
    <CpyBox>
      <CpyButton type="link" icon={<CopyOutlined />} onClick={e => handleCopy(e as unknown as MouseEvent)} />
      {isCopiedRecently && <CopiedIndicator>copied!</CopiedIndicator>}
    </CpyBox>
  );
}

const CpyBox = styled.div`
  display: flex;
  align-items: center;
`;

const CpyButton = styled(Button)`
  display: flex;
  align-items: center;
  height: 22px;
`;

const CopiedIndicator = styled.span`
  font-size: 10px;
  margin-left: -8px;
  color: ${Colors.greenOkay};
`;

export default CopyButton;
