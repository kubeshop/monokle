import React, {useState} from 'react';
import {Input} from 'antd';
import {TitleBar} from '@components/molecules';
import * as S from './styled';

function PluginManagerPane() {
  const [pluginUrl, setPluginUrl] = useState<string>();

  return (
    <div>
      <TitleBar title="Plugin Manager" />
      <S.Container>
        <p>Enter plugin URL:</p>
        <Input onChange={e => setPluginUrl(e.target.value)} />
        <h2>Active plugins</h2>
        <h2>Inactive plugins</h2>
      </S.Container>
    </div>
  );
}

export default PluginManagerPane;
