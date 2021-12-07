import React, {useMemo, useState} from 'react';

import {Button} from 'antd';

import {PlusOutlined} from '@ant-design/icons';

import {useAppSelector} from '@redux/hooks';

import {TitleBar} from '@components/molecules';

import PluginInformation from './PluginInformation';
import PluginInstallModal from './PluginInstallModal';

import * as S from './styled';

function PluginManagerPane() {
  const plugins = useAppSelector(state => state.main.plugins);

  const activePlugins = useMemo(() => plugins.filter(p => p.isActive), [plugins]);
  const inactivePlugins = useMemo(() => plugins.filter(p => !p.isActive), [plugins]);

  const [isInstallModalVisible, setInstallModalVisible] = useState<boolean>(false);
  const onClickInstallPlugin = () => {
    setInstallModalVisible(true);
  };
  const onCloseInstallPlugin = () => {
    setInstallModalVisible(false);
  };

  return (
    <div>
      <PluginInstallModal isVisible={isInstallModalVisible} onClose={onCloseInstallPlugin} />
      <TitleBar title="Plugin Manager">
        <Button onClick={onClickInstallPlugin} type="link" size="small" icon={<PlusOutlined />} />
      </TitleBar>
      <S.Container>
        {plugins.length === 0 ? (
          <p>No plugins installed yet.</p>
        ) : (
          <>
            {activePlugins.length > 0 && (
              <>
                <h2>Active plugins</h2>
                {activePlugins.map(activePlugin => (
                  <PluginInformation key={activePlugin.name} plugin={activePlugin} />
                ))}
              </>
            )}
            {inactivePlugins.length > 0 && (
              <>
                <h2>Inactive plugins</h2>
                {inactivePlugins.map(inactivePlugin => (
                  <PluginInformation key={inactivePlugin.name} plugin={inactivePlugin} />
                ))}
              </>
            )}
          </>
        )}
      </S.Container>
    </div>
  );
}

export default PluginManagerPane;
