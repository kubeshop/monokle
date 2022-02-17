import {Input} from 'antd';

import * as S from './styled';

const PreviewConfigurationEditor = () => {
  return (
    <div>
      <S.Field>
        <S.Label>Name your configuration:</S.Label>
        <Input placeholder="Enter the configuration name" />
      </S.Field>
      <S.Field>
        <S.Label style={{marginBottom: 0}}>Select which values files to use:</S.Label>
        <S.Description>Drag and drop to specify order</S.Description>
      </S.Field>
      <S.Field>
        <S.Label>Specify options:</S.Label>
      </S.Field>
    </div>
  );
};

export default PreviewConfigurationEditor;
