import {shell} from 'electron';

import {useCallback, useMemo, useState} from 'react';

import {Button, Skeleton, Tooltip, Typography} from 'antd';

import {PlusOutlined, ReloadOutlined} from '@ant-design/icons';

import _ from 'lodash';

import {PLUGINS_HELP_URL, TOOLTIP_DELAY} from '@constants/constants';
import {PluginManagerReloadTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {checkForExtensionsUpdates} from '@redux/services/extension';

import {SecondaryButton} from '@atoms';

import {DEFAULT_TEMPLATES_PLUGIN_URL} from '@shared/constants/urls';

import PluginInformation from './PluginInformation';
import PluginInstallModal from './PluginInstallModal';
import * as S from './PluginManager.styled';

const {Text} = Typography;

export const PluginManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const isLoadingExistingPlugins = useAppSelector(state => state.extension.isLoadingExistingPlugins);
  const pluginMap = useAppSelector(state => state.extension.pluginMap);
  const templateMap = useAppSelector(state => state.extension.templateMap);
  const templatePackMap = useAppSelector(state => state.extension.templatePackMap);

  const [isInstallModalVisible, setInstallModalVisible] = useState<boolean>(false);

  const sortedPluginEntries = useMemo(() => {
    return Object.entries(pluginMap).sort((a, b) => a[1].name.localeCompare(b[1].name));
  }, [pluginMap]);

  const chunckedSortedPluginEntries = useMemo(() => {
    return _.chunk(sortedPluginEntries, Math.ceil(sortedPluginEntries.length / 2));
  }, [sortedPluginEntries]);

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

  const openHelpUrl = () => {
    const repositoryUrl = PLUGINS_HELP_URL;
    shell.openExternal(repositoryUrl);
  };

  return (
    <>
      <PluginInstallModal isVisible={isInstallModalVisible} onClose={onCloseInstallPlugin} />

      <S.ButtonsContainer>
        <SecondaryButton onClick={onClickInstallPlugin} size="small" icon={<PlusOutlined />} style={{marginLeft: 8}}>
          Install
        </SecondaryButton>

        <div>
          <S.QuestionCircleOutlined onClick={openHelpUrl} />

          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={PluginManagerReloadTooltip} placement="bottom">
            <Button
              disabled={sortedPluginEntries.length === 0}
              onClick={onClickReload}
              type="link"
              size="small"
              icon={<ReloadOutlined />}
            />
          </Tooltip>
        </div>
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
            {sortedPluginEntries.length > 0 ? (
              <S.PluginsContainer>
                {chunckedSortedPluginEntries[0] ? (
                  chunckedSortedPluginEntries[0].map(([path, activePlugin]: any) => (
                    <S.PluginColumnContainer key={activePlugin.name}>
                      <PluginInformation plugin={activePlugin} pluginPath={path} />
                    </S.PluginColumnContainer>
                  ))
                ) : (
                  <S.PluginColumnContainer />
                )}
                {chunckedSortedPluginEntries[1] ? (
                  chunckedSortedPluginEntries[1].map(([path, activePlugin]: any) => (
                    <S.PluginColumnContainer key={activePlugin.name}>
                      <PluginInformation plugin={activePlugin} pluginPath={path} />
                    </S.PluginColumnContainer>
                  ))
                ) : (
                  <S.PluginColumnContainer />
                )}
              </S.PluginsContainer>
            ) : (
              <S.NotFoundLabel>No plugins found.</S.NotFoundLabel>
            )}
          </>
        )}
      </S.Container>
    </>
  );
};
