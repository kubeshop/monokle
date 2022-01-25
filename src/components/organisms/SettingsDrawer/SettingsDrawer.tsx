import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {Checkbox, Collapse, Tooltip} from 'antd';

import _ from 'lodash';

import {AutoLoadLastProjectTooltip} from '@constants/tooltips';

import {Project, ProjectConfig} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  changeCurrentProjectName,
  setKubeConfig,
  setScanExcludesStatus,
  updateClusterSelectorVisibilty,
  updateEnableHelmWithKustomize,
  updateFileIncludes,
  updateFolderReadsMaxDepth,
  updateHelmPreviewMode,
  updateHideExcludedFilesInFileExplorer,
  updateKustomizeCommand,
  updateLoadLastProjectOnStartup,
  updateProjectConfig,
  updateScanExcludes,
} from '@redux/reducers/appConfig';
import {toggleSettings} from '@redux/reducers/ui';
import {activeProjectSelector} from '@redux/selectors';

import Drawer from '@components/atoms/Drawer';

import {Settings} from './Settings';
import * as S from './Styles';

const {Panel} = Collapse;

const SettingsDrawer = () => {
  const dispatch = useAppDispatch();
  const isSettingsOpened = Boolean(useAppSelector(state => state.ui.isSettingsOpen));

  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const [activePanels, setActivePanels] = useState<number[]>([3]);
  const appConfig = useAppSelector(state => state.config);
  const projectConfig = useAppSelector(state => state.config.projectConfig);
  const isClusterSelectorVisible = useAppSelector(state => state.config.isClusterSelectorVisible);
  const loadLastProjectOnStartup = useAppSelector(state => state.config.loadLastProjectOnStartup);

  const activeProject: Project | undefined = useSelector(activeProjectSelector);

  useEffect(() => {
    if (highlightedItems.clusterPaneIcon) {
      setActivePanels(_.uniq([...activePanels, 3]));
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
    dispatch(updateProjectConfig({config, fromConfigFile: false}));
  };

  const changeApplicationConfig = (config: ProjectConfig) => {
    if (!_.isEqual(config.settings?.enableHelmWithKustomize, appConfig.settings.enableHelmWithKustomize)) {
      dispatch(updateEnableHelmWithKustomize(Boolean(config.settings?.enableHelmWithKustomize)));
    }
    if (!_.isEqual(config.settings?.helmPreviewMode, appConfig.settings.helmPreviewMode)) {
      dispatch(updateHelmPreviewMode(config.settings?.helmPreviewMode || 'template'));
    }
    if (!_.isEqual(config.settings?.kustomizeCommand, appConfig.settings.kustomizeCommand)) {
      dispatch(updateKustomizeCommand(config.settings?.kustomizeCommand || 'kubectl'));
    }
    if (
      !_.isEqual(config.settings?.hideExcludedFilesInFileExplorer, appConfig.settings.hideExcludedFilesInFileExplorer)
    ) {
      dispatch(updateHideExcludedFilesInFileExplorer(Boolean(config.settings?.hideExcludedFilesInFileExplorer)));
    }
    if (!_.isEqual(config.kubeConfig?.path, appConfig.kubeConfig.path)) {
      dispatch(setKubeConfig({...appConfig.kubeConfig, path: config.kubeConfig?.path}));
    }
    if (!_.isEqual(config?.folderReadsMaxDepth, appConfig.folderReadsMaxDepth)) {
      dispatch(updateFolderReadsMaxDepth(config?.folderReadsMaxDepth || 10));
    }
    if (!_.isEqual(_.sortBy(config?.scanExcludes), _.sortBy(appConfig.scanExcludes))) {
      dispatch(setScanExcludesStatus('outdated'));
      dispatch(updateScanExcludes(config?.scanExcludes || []));
    }
    if (!_.isEqual(_.sortBy(config?.fileIncludes), _.sortBy(appConfig.fileIncludes))) {
      dispatch(updateFileIncludes(config?.fileIncludes || []));
    }
  };

  const handleChangeLoadLastFolderOnStartup = (e: any) => {
    dispatch(updateLoadLastProjectOnStartup(e.target.checked));
  };

  const handleChangeClusterSelectorVisibilty = (e: any) => {
    dispatch(updateClusterSelectorVisibilty(e.target.checked));
  };

  const onProjectNameChange = (projectName: string) => {
    if (projectName) {
      dispatch(changeCurrentProjectName(projectName));
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
        <Panel header="Global Settings" key="1">
          <S.Div>
            <S.Span>On Startup</S.Span>
            <Tooltip title={AutoLoadLastProjectTooltip}>
              <Checkbox checked={loadLastProjectOnStartup} onChange={handleChangeLoadLastFolderOnStartup}>
                Automatically load last project
              </Checkbox>
            </Tooltip>
          </S.Div>
          <S.Div style={{marginTop: 16}}>
            <Checkbox checked={isClusterSelectorVisible} onChange={handleChangeClusterSelectorVisibilty}>
              Show Cluster Selector
            </Checkbox>
          </S.Div>
        </Panel>
        <Panel header="Default Project Settings" key="2">
          <Settings config={appConfig} onConfigChange={changeApplicationConfig} />
        </Panel>
        {activeProject && (
          <Panel header="Active Project Settings" key="3">
            <Settings
              config={projectConfig}
              onConfigChange={changeProjectConfig}
              showProjectName
              projectName={activeProject.name}
              onProjectNameChange={onProjectNameChange}
              isClusterPaneIconHighlighted={highlightedItems.clusterPaneIcon}
            />
          </Panel>
        )}
      </Collapse>
    </Drawer>
  );
};

export default SettingsDrawer;
