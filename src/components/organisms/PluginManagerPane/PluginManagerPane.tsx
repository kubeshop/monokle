import {useCallback, useMemo, useState} from 'react';

import {Button, Input, Skeleton, Tooltip} from 'antd';

import {PlusOutlined, ReloadOutlined} from '@ant-design/icons';

import {PluginManagerPaneReloadTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {checkForExtensionsUpdates} from '@redux/services/extension';

import {TitleBar} from '@components/molecules';

import PluginInformation from './PluginInformation';
import PluginInstallModal from './PluginInstallModal';
import * as S from './PluginManagerPane.styled';

const filterPluginBySearchedValue = (searchedValue: string, name: string) => {
  let shouldBeFiltered = true;
  const splittedSearchedValue = searchedValue.split(' ');

  for (let i = 0; i < splittedSearchedValue.length; i += 1) {
    if (!name.split(' ').find(namePart => namePart.toLowerCase().includes(splittedSearchedValue[i].toLowerCase()))) {
      shouldBeFiltered = false;
      break;
    }
  }

  return shouldBeFiltered;
};

function PluginManagerPane() {
  const dispatch = useAppDispatch();
  const isLoadingExistingPlugins = useAppSelector(state => state.extension.isLoadingExistingPlugins);
  const pluginMap = useAppSelector(state => state.extension.pluginMap);
  const templateMap = useAppSelector(state => state.extension.templateMap);
  const templatePackMap = useAppSelector(state => state.extension.templatePackMap);

  const [searchedValue, setSearchedValue] = useState<string>();

  const plugins = useMemo(() => Object.values(pluginMap), [pluginMap]);
  const activePlugins = useMemo(
    () =>
      Object.entries(pluginMap).filter(
        p => p[1].isActive && (searchedValue ? filterPluginBySearchedValue(searchedValue, p[1].name) : true)
      ),
    [pluginMap, searchedValue]
  );
  const inactivePlugins = useMemo(
    () =>
      Object.entries(pluginMap).filter(
        p => !p[1].isActive && (searchedValue ? filterPluginBySearchedValue(searchedValue, p[1].name) : true)
      ),
    [pluginMap, searchedValue]
  );

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
        <Input.Search
          placeholder="Search plugin by name"
          style={{marginBottom: '20px'}}
          value={searchedValue}
          onChange={e => setSearchedValue(e.target.value)}
        />
        {plugins.length === 0 ? (
          <>{isLoadingExistingPlugins ? <Skeleton /> : <p>No plugins installed yet.</p>}</>
        ) : (
          <>
            {activePlugins.length > 0 && (
              <>
                <h2>Active plugins</h2>
                {activePlugins.map(([path, activePlugin]) => (
                  <PluginInformation key={activePlugin.name} plugin={activePlugin} pluginPath={path} />
                ))}
              </>
            )}
            {inactivePlugins.length > 0 && (
              <>
                <h2>Inactive plugins</h2>
                {inactivePlugins.map(([path, inactivePlugin]) => (
                  <PluginInformation key={inactivePlugin.name} plugin={inactivePlugin} pluginPath={path} />
                ))}
              </>
            )}
            {!activePlugins.length && !inactivePlugins.length && <S.NotFoundLabel>No plugins found.</S.NotFoundLabel>}
          </>
        )}
      </S.Container>
    </div>
  );
}

export default PluginManagerPane;
