import {useCallback, useMemo, useState} from 'react';

import {Button, Skeleton, Tooltip, Typography} from 'antd';

import {PlusOutlined, ReloadOutlined} from '@ant-design/icons';

import {DEFAULT_TEMPLATES_PLUGIN_URL} from '@constants/constants';
import {PluginManagerDrawerReloadTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {checkForExtensionsUpdates} from '@redux/services/extension';

import PluginInformation from './PluginInformation';
import PluginInstallModal from './PluginInstallModal';
import * as S from './PluginManager.styled';

const {Text} = Typography;

const PluginManagerDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const isLoadingExistingPlugins = useAppSelector(state => state.extension.isLoadingExistingPlugins);
  const pluginMap = useAppSelector(state => state.extension.pluginMap);
  const templateMap = useAppSelector(state => state.extension.templateMap);
  const templatePackMap = useAppSelector(state => state.extension.templatePackMap);

  const [isInstallModalVisible, setInstallModalVisible] = useState<boolean>(false);

  const sortedPluginEntries = useMemo(() => {
    return Object.entries(pluginMap).sort((a, b) => a[1].name.localeCompare(b[1].name));
  }, [pluginMap]);

  const onClickReload = useCallback(
    () => checkForExtensionsUpdates({templateMap, pluginMap, templatePackMap}, dispatch),
    [templateMap, pluginMap, templatePackMap, dispatch]
  );

  const onClickInstallPlugin = () => {
    setInstallModalVisible(true);
  };

  const onCloseInstallPlugin = () => {
    setInstallModalVisible(false);
  };

  return (
    <>
      <PluginInstallModal isVisible={isInstallModalVisible} onClose={onCloseInstallPlugin} />
      <S.ButtonsContainer>
        <Tooltip title={PluginManagerDrawerReloadTooltip} placement="bottom">
          <Button
            disabled={sortedPluginEntries.length === 0}
            onClick={onClickReload}
            type="link"
            size="small"
            icon={<ReloadOutlined />}
          >
            Update
          </Button>
        </Tooltip>
        <Button
          onClick={onClickInstallPlugin}
          type="primary"
          ghost
          size="small"
          icon={<PlusOutlined />}
          style={{marginLeft: 8}}
        >
          Install
        </Button>
      </S.ButtonsContainer>
      <S.Container>
        {sortedPluginEntries.length === 0 ? (
          <>
            {isLoadingExistingPlugins ? (
              <Skeleton />
            ) : (
              <div>
                <p>No plugins installed yet.</p>
                <p>
                  Reinstall the default Templates plugin using the below URL in the Plugin Installation modal by
                  clicking on the Install button.
                </p>
                <Text code copyable>
                  {DEFAULT_TEMPLATES_PLUGIN_URL}
                </Text>
              </div>
            )}
          </>
        ) : (
          <>
            {sortedPluginEntries.length > 0 &&
              sortedPluginEntries.map(([path, activePlugin]) => (
                <PluginInformation key={activePlugin.name} plugin={activePlugin} pluginPath={path} />
              ))}
            {!sortedPluginEntries.length && <S.NotFoundLabel>No plugins found.</S.NotFoundLabel>}
          </>
        )}
      </S.Container>
    </>
  );
};

export default PluginManagerDrawer;
