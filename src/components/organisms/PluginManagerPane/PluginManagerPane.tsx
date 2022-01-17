import React, {useCallback, useMemo, useState} from 'react';

import {Button, Skeleton, Tooltip} from 'antd';

import {PlusOutlined, ReloadOutlined} from '@ant-design/icons';

import {PluginManagerPaneReloadTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {checkForExtensionsUpdates} from '@redux/services/extension';

import {TitleBar} from '@components/molecules';

import PluginInformation from './PluginInformation';
import PluginInstallModal from './PluginInstallModal';

import * as S from './styled';

function PluginManagerPane() {
  const dispatch = useAppDispatch();
  const plugins = useAppSelector(state => Object.values(state.extension.pluginMap));
  const isLoadingExistingPlugins = useAppSelector(state => state.extension.isLoadingExistingPlugins);

  const activePlugins = useMemo(() => plugins.filter(p => p.isActive), [plugins]);
  const inactivePlugins = useMemo(() => plugins.filter(p => !p.isActive), [plugins]);

  const [isInstallModalVisible, setInstallModalVisible] = useState<boolean>(false);

  const onClickInstallPlugin = () => {
    setInstallModalVisible(true);
  };

  const onClickReload = useCallback(() => checkForExtensionsUpdates(dispatch), [dispatch]);

  const onCloseInstallPlugin = () => {
    setInstallModalVisible(false);
  };

  return (
    <div>
      <PluginInstallModal isVisible={isInstallModalVisible} onClose={onCloseInstallPlugin} />
      <TitleBar title="Plugin Manager">
        <Tooltip title={PluginManagerPaneReloadTooltip} placement="bottom">
          <Tooltip title={PluginManagerPaneReloadTooltip} placement="bottom">
            <Button
              disabled={plugins.length === 0}
              onClick={onClickReload}
              type="link"
              size="small"
              icon={<ReloadOutlined />}
            />
          </Tooltip>
          <Button
            disabled={plugins.length === 0}
            onClick={onClickReload}
            type="link"
            size="small"
            icon={<ReloadOutlined />}
          />
        </Tooltip>
        <Button onClick={onClickInstallPlugin} type="link" size="small" icon={<PlusOutlined />} />
      </TitleBar>
      <S.Container>
        {plugins.length === 0 ? (
          <>{isLoadingExistingPlugins ? <Skeleton /> : <p>No plugins installed yet.</p>}</>
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
