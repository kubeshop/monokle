import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {Collapse} from 'antd';

import _ from 'lodash';

import {Project, ProjectConfig} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {toggleClusterStatus, updateLoadLastProjectOnStartup, updateProjectConfig} from '@redux/reducers/appConfig';
import {toggleSettings} from '@redux/reducers/ui';
import {activeProjectSelector, currentConfigSelector} from '@redux/selectors';

import Drawer from '@components/atoms/Drawer';

import {Settings} from './Settings';

const {Panel} = Collapse;

const SettingsDrawer = () => {
  const dispatch = useAppDispatch();
  const isSettingsOpened = Boolean(useAppSelector(state => state.ui.isSettingsOpen));

  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const [activePanels, setActivePanels] = useState<number[]>([2]);
  const appConfig = useAppSelector(state => state.config);
  const currentConfig = useAppSelector(currentConfigSelector);

  const activeProject: Project | undefined = useSelector(activeProjectSelector);

  useEffect(() => {
    if (highlightedItems.clusterPaneIcon) {
      setActivePanels(_.uniq([...activePanels, 1]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedItems.clusterPaneIcon]);

  const handlePaneCollapse = (value: any) => {
    setActivePanels(_.uniq([...value]));
  };

  const toggleSettingsDrawer = () => {
    dispatch(toggleSettings());
  };

  const changeProjectConfig = (config: ProjectConfig) => {
    dispatch(updateProjectConfig(config));
  };

  const changeApplicationConfig = (config: ProjectConfig) => {
    if (!_.isEqual(config.settings?.isClusterSelectorVisible, appConfig.settings.isClusterSelectorVisible)) {
      dispatch(toggleClusterStatus());
    }
    if (!_.isEqual(config.settings?.loadLastProjectOnStartup, appConfig.settings.loadLastProjectOnStartup)) {
      dispatch(updateLoadLastProjectOnStartup(Boolean(config.settings?.loadLastProjectOnStartup)));
    }
  };

  return (
    <Drawer
      width="400"
      noborder="true"
      title="Settings"
      placement="right"
      closable={false}
      onClose={toggleSettingsDrawer}
      visible={isSettingsOpened}
      bodyStyle={{padding: 0}}
    >
      <Collapse bordered={false} activeKey={activePanels} onChange={handlePaneCollapse}>
        <Panel header="Default Settings" key="1">
          <Settings config={appConfig} onConfigChange={changeApplicationConfig} showLoadLastProjectOnStartup />
        </Panel>
        {activeProject && (
          <Panel header={`${activeProject.name} Settings`} key="2">
            <Settings config={currentConfig} onConfigChange={changeProjectConfig} />
          </Panel>
        )}
      </Collapse>
    </Drawer>
  );
};

export default SettingsDrawer;
