import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {Collapse} from 'antd';

import _ from 'lodash';

import {Project} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateLoadLastProjectOnStartup} from '@redux/reducers/appConfig';
import {toggleClusterStatus, toggleSettings} from '@redux/reducers/ui';
import {activeProjectSelector} from '@redux/selectors';

import Drawer from '@components/atoms/Drawer';

import {Settings} from './Settings';

const {Panel} = Collapse;

const SettingsDrawer = () => {
  const dispatch = useAppDispatch();
  const isSettingsOpened = Boolean(useAppSelector(state => state.ui.isSettingsOpen));

  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const [activePanels, setActivePanels] = useState<number[]>([2]);
  const clusterStatusHidden = useAppSelector(state => state.ui.clusterStatusHidden);
  const appConfig = useAppSelector(state => state.config);

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

  const changeProjectSettings = (settings: any) => {
    // if (activeProject) {
    // }
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
          <Settings
            isClusterSelectorVisible={clusterStatusHidden}
            fileIncludes={appConfig.fileIncludes}
            scanExcludes={appConfig.scanExcludes}
            helmPreviewMode={appConfig.settings.helmPreviewMode}
            kustomizeCommand={appConfig.settings.kustomizeCommand}
            folderReadsMaxDepth={appConfig.folderReadsMaxDepth}
            hideExcludedFilesInFileExplorer={appConfig.settings.hideExcludedFilesInFileExplorer}
            loadLastProjectOnStartup={appConfig.settings.loadLastProjectOnStartup}
            onLoadLastProjectOnStartupChange={(value: boolean) => dispatch(updateLoadLastProjectOnStartup(value))}
            showLoadLastProjectOnStartup
            onClusterSelectorVisibleChange={() => dispatch(toggleClusterStatus())}
          />
        </Panel>
        {activeProject && (
          <Panel header={`${activeProject.name} Settings`} key="2">
            <Settings
              isClusterSelectorVisible={activeProject.settings && activeProject.settings.isClusterSelectorVisible}
              isClusterPaneIconHighlighted={highlightedItems.clusterPaneIcon}
              fileIncludes={activeProject.fileIncludes}
              scanExcludes={activeProject.scanExcludes}
              helmPreviewMode={activeProject.settings && activeProject.settings.helmPreviewMode}
              kustomizeCommand={activeProject.settings && activeProject.settings.kustomizeCommand}
              folderReadsMaxDepth={activeProject.folderReadsMaxDepth}
              hideExcludedFilesInFileExplorer={
                activeProject.settings && activeProject.settings.hideExcludedFilesInFileExplorer
              }
              onClusterSelectorVisibleChange={() =>
                changeProjectSettings({
                  ...activeProject.settings,
                  isClusterSelectorVisible: !(
                    activeProject.settings && activeProject.settings.isClusterSelectorVisible
                  ),
                })
              }
            />
          </Panel>
        )}
      </Collapse>
    </Drawer>
  );
};

export default SettingsDrawer;
