import React, {useEffect, useState} from 'react';
import {useDebounce} from 'react-use';

import {Button, Checkbox, Form, Input, Select, Tooltip} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import _ from 'lodash';

import {DEFAULT_KUBECONFIG_DEBOUNCE, PREDEFINED_K8S_VERSION, TOOLTIP_DELAY} from '@constants/constants';
import {AutoLoadLastProjectTooltip, TelemetryDocumentationUrl} from '@constants/tooltips';

import {Project, ProjectConfig} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  changeCurrentProjectName,
  changeProjectsRootPath,
  setKubeConfig,
  toggleErrorReporting,
  toggleEventTracking,
  updateApplicationSettings,
  updateClusterSelectorVisibilty,
  updateFileExplorerSortOrder,
  updateFileIncludes,
  updateFolderReadsMaxDepth,
  updateK8sVersion,
  updateLoadLastProjectOnStartup,
  updateProjectConfig,
  updateScanExcludes,
  updateUsingKubectlProxy,
} from '@redux/reducers/appConfig';
import {activeProjectSelector, currentConfigSelector} from '@redux/selectors';
import {monitorKubeConfig} from '@redux/services/monitorKubeConfig';

import {SettingsPanel} from '@organisms/SettingsManager/types';

import {FileExplorer} from '@atoms';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {openUrlInExternalBrowser} from '@utils/shell';

import Colors from '@styles/Colors';

import {Settings} from './Settings';

import * as S from './styled';

const SettingsManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeProject: Project | undefined = useAppSelector(activeProjectSelector);
  const mergedConfig: ProjectConfig = useAppSelector(currentConfigSelector);
  const appConfig = useAppSelector(state => state.config);
  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const activeSettingsPanel = useAppSelector(state => state.ui.activeSettingsPanel);
  const isClusterSelectorVisible = useAppSelector(state => state.config.isClusterSelectorVisible);
  const loadLastProjectOnStartup = useAppSelector(state => state.config.loadLastProjectOnStartup);
  const projectsRootPath = useAppSelector(state => state.config.projectsRootPath);
  const disableEventTracking = useAppSelector(state => state.config.disableEventTracking);
  const disableErrorReporting = useAppSelector(state => state.config.disableErrorReporting);
  const previewingCluster = useAppSelector(state => state.ui.previewingCluster);
  const useKubectlProxy = useAppSelector(state => state.config.useKubectlProxy);

  const [activeTab, setActiveTab] = useState<string>(
    activeSettingsPanel ? String(activeSettingsPanel) : SettingsPanel.ActiveProjectSettings
  );
  const [currentProjectsRootPath, setCurrentProjectsRootPath] = useState(projectsRootPath);

  const [settingsForm] = useForm();
  const [fileExplorerForm] = useForm();

  useEffect(() => {
    if (highlightedItems.clusterPaneIcon) {
      setActiveTab(SettingsPanel.ActiveProjectSettings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedItems.clusterPaneIcon]);

  const handlePaneCollapse = (value: string) => {
    setActiveTab(value);
  };

  useEffect(() => {
    if (previewingCluster || !activeProject) {
      setActiveTab(SettingsPanel.DefaultProjectSettings);
    }
  }, [activeProject, previewingCluster]);

  const changeProjectConfig = (config: ProjectConfig) => {
    dispatch(updateProjectConfig({config, fromConfigFile: false}));
    monitorKubeConfig(dispatch, config.kubeConfig?.path);
  };

  const changeApplicationConfig = (config: ProjectConfig) => {
    dispatch(
      updateApplicationSettings({
        ...config.settings,
        helmPreviewMode: config.settings?.helmPreviewMode || 'template',
        kustomizeCommand: config.settings?.kustomizeCommand || 'kubectl',
      })
    );

    if (!_.isEqual(config.kubeConfig?.path, appConfig.kubeConfig.path)) {
      dispatch(setKubeConfig({...appConfig.kubeConfig, path: config.kubeConfig?.path}));
      monitorKubeConfig(dispatch, config.kubeConfig?.path);
    }
    if (!_.isEqual(config?.folderReadsMaxDepth, appConfig.folderReadsMaxDepth)) {
      dispatch(updateFolderReadsMaxDepth(config?.folderReadsMaxDepth || 10));
    }
    if (!_.isEqual(config?.k8sVersion, appConfig.k8sVersion)) {
      dispatch(updateK8sVersion(config?.k8sVersion || PREDEFINED_K8S_VERSION));
    }
    if (!_.isEqual(_.sortBy(config?.scanExcludes), _.sortBy(appConfig.scanExcludes))) {
      dispatch(updateScanExcludes(config?.scanExcludes || []));
    }
    if (!_.isEqual(_.sortBy(config?.fileIncludes), _.sortBy(appConfig.fileIncludes))) {
      dispatch(updateFileIncludes(config?.fileIncludes || []));
    }
  };

  const handleChangeLoadLastFolderOnStartup = (e: any) => {
    dispatch(updateLoadLastProjectOnStartup(e.target.checked));
  };

  const handleChangeUsingKubectlProxy = (e: any) => {
    dispatch(updateUsingKubectlProxy(e.target.checked));
  };

  const handleChangeClusterSelectorVisibilty = (e: any) => {
    dispatch(updateClusterSelectorVisibilty(e.target.checked));
  };

  const handleToggleEventTracking = () => {
    dispatch(toggleEventTracking());
  };

  const handleToggleErrorReporting = () => {
    dispatch(toggleErrorReporting());
  };

  const onProjectNameChange = (projectName: string) => {
    if (projectName) {
      dispatch(changeCurrentProjectName(projectName));
    }
  };

  useEffect(() => {
    settingsForm.setFieldsValue({projectsRootPath});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsRootPath]);

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (folderPath) {
        settingsForm.setFieldsValue({projectsRootPath: folderPath});
        setCurrentProjectsRootPath(folderPath);
      }
    },
    {isDirectoryExplorer: true}
  );

  useDebounce(
    () => {
      if (currentProjectsRootPath && currentProjectsRootPath !== projectsRootPath) {
        dispatch(changeProjectsRootPath(currentProjectsRootPath));
      }
    },
    DEFAULT_KUBECONFIG_DEBOUNCE,
    [currentProjectsRootPath]
  );

  const tabItems = [
    ...(activeProject
      ? [
          {
            key: SettingsPanel.ActiveProjectSettings,
            label: 'Active project',
            children: (
              <Settings
                config={mergedConfig}
                onConfigChange={changeProjectConfig}
                showProjectName
                projectName={activeProject.name}
                onProjectNameChange={onProjectNameChange}
                isClusterPaneIconHighlighted={highlightedItems.clusterPaneIcon}
              />
            ),
          },
        ]
      : []),
    {
      key: SettingsPanel.DefaultProjectSettings,
      label: 'Default project',
      children: <Settings config={appConfig} onConfigChange={changeApplicationConfig} />,
    },
    {
      key: SettingsPanel.GlobalSettings,
      label: 'Global',
      children: (
        <>
          <Form
            form={settingsForm}
            initialValues={() => ({projectsRootPath})}
            autoComplete="off"
            onFieldsChange={(field: any, allFields: any) => {
              const rootPath = allFields.filter((f: any) => _.includes(f.name.toString(), 'projectsRootPath'))[0].value;
              setCurrentProjectsRootPath(rootPath);
            }}
          >
            <>
              <S.Heading>Projects Root Path</S.Heading>
              <Form.Item required tooltip="The local path where your projects will live.">
                <Input.Group compact>
                  <Form.Item
                    name="projectsRootPath"
                    noStyle
                    rules={[
                      {
                        required: true,
                        message: 'Please provide your projects root path!',
                      },
                    ]}
                  >
                    <Input style={{width: 'calc(100% - 100px)'}} />
                  </Form.Item>
                  <Button style={{width: '100px'}} onClick={openFileExplorer}>
                    Browse
                  </Button>
                </Input.Group>
              </Form.Item>
            </>
          </Form>

          <S.Div>
            <S.Span>Cluster Connection</S.Span>
            <Checkbox checked={useKubectlProxy} onChange={handleChangeUsingKubectlProxy}>
              Enable Proxy
            </Checkbox>
            <S.Description>
              If this setting is enabled, Monokle will start a proxy to the Kubernetes API server before connecting to
              the cluster.
            </S.Description>
          </S.Div>

          <S.Div>
            <S.Span>On Startup</S.Span>
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={AutoLoadLastProjectTooltip}>
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
          <S.Div>
            <S.TelemetryTitle>Telemetry</S.TelemetryTitle>
            <S.Div style={{marginBottom: '8px'}}>
              <Checkbox checked={disableEventTracking} onChange={handleToggleEventTracking}>
                Disable gathering of <S.BoldSpan>usage metrics</S.BoldSpan>
              </Checkbox>
            </S.Div>
            <S.Div style={{marginBottom: '8px'}}>
              <Checkbox checked={disableErrorReporting} onChange={handleToggleErrorReporting}>
                Disable gathering of <S.BoldSpan>error reports</S.BoldSpan>
              </Checkbox>
            </S.Div>
            <S.TelemetryInfo>
              <S.TelemetryDescription>Data gathering is anonymous.</S.TelemetryDescription>
              <S.TelemetryReadMoreLink
                style={{color: Colors.blue6}}
                onClick={() => openUrlInExternalBrowser(TelemetryDocumentationUrl)}
              >
                Read more about it in our documentation.
              </S.TelemetryReadMoreLink>
            </S.TelemetryInfo>
          </S.Div>

          <S.Div>
            <S.Span>File explorer</S.Span>

            <Form
              initialValues={{fileExplorerSortOrder: appConfig.fileExplorerSortOrder}}
              form={fileExplorerForm}
              layout="vertical"
              onValuesChange={values => {
                dispatch(updateFileExplorerSortOrder(values.fileExplorerSortOrder));
              }}
            >
              <Form.Item label="Sort order" name="fileExplorerSortOrder">
                <Select style={{width: '100%'}}>
                  <Select.Option key="folders" value="folders">
                    Folders first
                  </Select.Option>
                  <Select.Option key="files" value="files">
                    Files first
                  </Select.Option>
                  <Select.Option key="mixed" value="mixed">
                    Mixed
                  </Select.Option>
                </Select>
              </Form.Item>
            </Form>
          </S.Div>
        </>
      ),
    },
  ];

  return (
    <>
      <S.Tabs
        activeKey={activeTab}
        items={tabItems}
        onChange={handlePaneCollapse}
        renderTabBar={(props: any, DefaultTabBar: any) => <DefaultTabBar {...props} style={{padding: '0 1rem'}} />}
      />

      <FileExplorer {...fileExplorerProps} />
    </>
  );
};

export default SettingsManager;
