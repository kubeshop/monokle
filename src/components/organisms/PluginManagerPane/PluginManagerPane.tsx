import {useCallback, useMemo, useState} from 'react';

import {Button, Skeleton, Tooltip} from 'antd';

import {PlusOutlined, ReloadOutlined} from '@ant-design/icons';

import {PluginManagerPaneReloadTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {checkForExtensionsUpdates} from '@redux/services/extension';

import {TitleBar} from '@components/molecules';

import PluginInformation from './PluginInformation';
import PluginInstallModal from './PluginInstallModal';
import * as S from './PluginManagerPane.styled';

function PluginManagerPane() {
  const dispatch = useAppDispatch();
  const isLoadingExistingPlugins = useAppSelector(state => state.extension.isLoadingExistingPlugins);

  const pluginMap = useAppSelector(state => state.extension.pluginMap);
  const templateMap = useAppSelector(state => state.extension.templateMap);
  const templatePackMap = useAppSelector(state => state.extension.templatePackMap);
  const plugins = useMemo(() => Object.values(pluginMap), [pluginMap]);

  const [isInstallModalVisible, setInstallModalVisible] = useState<boolean>(false);

  const onClickInstallPlugin = () => {
    setInstallModalVisible(true);
  };

  const onClickReload = useCallback(
    () => checkForExtensionsUpdates({templateMap, pluginMap, templatePackMap}, dispatch),
    [templateMap, pluginMap, templatePackMap, dispatch]
  );

  const onCloseInstallPlugin = () => {
    setInstallModalVisible(false);
  };

  return (
    <div>
      <PluginInstallModal isVisible={isInstallModalVisible} onClose={onCloseInstallPlugin} />
      <TitleBar title="Plugin Manager">
        <Tooltip title={PluginManagerPaneReloadTooltip} placement="bottom">
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
            {plugins.length > 0 &&
              Object.entries(pluginMap).map(([path, activePlugin]) => (
                <PluginInformation key={activePlugin.name} plugin={activePlugin} pluginPath={path} />
              ))}
            {!plugins.length && <S.NotFoundLabel>No plugins found.</S.NotFoundLabel>}
          </>
        )}
      </S.Container>
    </div>
  );
}

export default PluginManagerPane;
