import {ExclamationCircleFilled} from '@ant-design/icons';

import {openUrlInExternalBrowser} from '@utils/shell';

import * as S from './Guide.styled';

const Guide = () => {
  return (
    <S.Container>
      <ExclamationCircleFilled />

      <S.Item onClick={() => openUrlInExternalBrowser('https://kubeshop.github.io/monokle/features')}>
        Read a quick start guide
      </S.Item>

      <S.Item onClick={() => openUrlInExternalBrowser('https://www.youtube.com/watch?v=ossBDhP_K-4')}>
        Watch a 3-minute video tutorial
      </S.Item>

      <S.Item onClick={() => openUrlInExternalBrowser('https://kubeshop.github.io/monokle')}>Documentation</S.Item>
    </S.Container>
  );
};

export default Guide;
