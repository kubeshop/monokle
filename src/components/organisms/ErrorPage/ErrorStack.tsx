import {useState} from 'react';

import {Space} from 'antd';

import {AnimatePresence} from 'framer-motion';

import * as S from './ErrorStack.styled';

type Props = {error: Error};

export function ErrorStack({error}: Props) {
  const [showError, setShowError] = useState<boolean>(false);

  return (
    <S.ErrorStack>
      <S.ErrorButton type="link" onClick={() => setShowError(!showError)}>
        <Space>
          Show error stack <S.DownOutlined size={4} />
        </Space>
      </S.ErrorButton>
      <AnimatePresence initial={false}>
        {showError && (
          <S.ErrorStackContent
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: {opacity: 1, height: 200},
              collapsed: {opacity: 0, height: 0},
            }}
            transition={{duration: 0.6}}
          >
            <code>{error.message}</code>
            <pre>
              <code>{error.stack}</code>
            </pre>
          </S.ErrorStackContent>
        )}
      </AnimatePresence>
    </S.ErrorStack>
  );
}
