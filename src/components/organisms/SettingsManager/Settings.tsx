import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useDebounce} from 'react-use';

import {Button, Checkbox, Form, Input, InputNumber, Select, Tooltip} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import _ from 'lodash';
import path from 'path';

import {
  DEFAULT_EDITOR_DEBOUNCE,
  DEFAULT_KUBECONFIG_DEBOUNCE,
  K8S_VERSIONS,
  TOOLTIP_DELAY,
  TOOLTIP_K8S_SELECTION,
  ROOT_FILE_ENTRY,
} from '@constants/constants';
import {
  AddExclusionPatternTooltip,
  AddInclusionPatternTooltip,
  BrowseKubeconfigTooltip,
  EnableHelmWithKustomizeTooltip,
  HelmPreviewModeTooltip,
  KubeconfigPathTooltip,
  KustomizeCommandTooltip,
} from '@constants/tooltips';

import {ProjectConfig} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateShouldOptionalIgnoreUnsatisfiedRefs} from '@redux/reducers/main';
import {isInClusterModeSelector} from '@redux/selectors';
import {downloadSchema, schemaExists} from '@redux/services/k8sVersionService';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import FilePatternList from '@molecules/FilePatternList';

import {useFocus} from '@utils/hooks';

import * as S from './styled';

type SettingsProps = {
  config?: ProjectConfig | null;
  showProjectName?: boolean;
  projectName?: string;
  onProjectNameChange?: Function;
  onConfigChange?: Function;
  isClusterPaneIconHighlighted?: boolean | null;
};

export const Settings = ({
  config,
  onConfigChange,
  isClusterPaneIconHighlighted,
  projectName,
  onProjectNameChange,
  showProjectName,
}: SettingsProps) => {
  const dispatch = useAppDispatch();
  const [settingsForm] = useForm();
  const isSettingsOpened = Boolean(useAppSelector(state => state.ui.isSettingsOpen));

  const resourceRefsProcessingOptions = useAppSelector(state => state.main.resourceRefsProcessingOptions);
  const uiState = useAppSelector(state => state.ui);
  const {isScanIncludesUpdated, isScanExcludesUpdated} = useAppSelector(state => state.config);
  const filePath = useAppSelector(state => state.main.fileMap[ROOT_FILE_ENTRY]?.filePath);

  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const fileInput = useRef<HTMLInputElement>(null);
  const [inputRef, focusInput] = useFocus<Input>();
  const wasRehydrated = useAppSelector(state => state.main.wasRehydrated);
  const [isClusterActionDisabled, setIsClusterActionDisabled] = useState(
    Boolean(!config?.kubeConfig?.path) || Boolean(!config?.kubeConfig?.isPathValid)
  );
  const [currentKubeConfig, setCurrentKubeConfig] = useState(config?.kubeConfig?.path);
  const [currentProjectName, setCurrentProjectName] = useState(projectName);
  const isEditingDisabled = uiState.isClusterDiffVisible || isInClusterMode;
  const [k8sVersions] = useState<Array<string>>(K8S_VERSIONS);
  const userDataDir = useAppSelector(state => state.config.userDataDir);
  const [selectedK8SVersion, setSelectedK8SVersion] = useState<string>(String(config?.k8sVersion));
  const [isSchemaDownloading, setIsSchemaDownloading] = useState<boolean>(false);
  const [localConfig, setLocalConfig] = useState<ProjectConfig | null | undefined>(config);

  const handleConfigChange = () => {
    if (onConfigChange && !_.isEqual(localConfig, config)) {
      onConfigChange(localConfig);
    }
  };

  useEffect(() => {
    setIsClusterActionDisabled(Boolean(!config?.kubeConfig?.path) || Boolean(!config?.kubeConfig?.isPathValid));
    setCurrentKubeConfig(config?.kubeConfig?.path);
  }, [config?.kubeConfig]);

  useEffect(() => {
    // If config prop is changed externally, This code will make localConfig even with config prop
    setLocalConfig(config);
  }, [config]);

  useEffect(() => {
    handleConfigChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localConfig]);

  useEffect(() => {
    settingsForm.setFieldsValue({projectName});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectName]);

  useDebounce(
    () => {
      handleConfigChange();
    },
    DEFAULT_EDITOR_DEBOUNCE,
    [localConfig?.folderReadsMaxDepth]
  );

  const onChangeFileIncludes = (patterns: string[]) => {
    setLocalConfig({...localConfig, fileIncludes: patterns});
  };

  const onChangeNamespaces = (namespaces: string[]) => {
    setLocalConfig({
      ...localConfig,
      settings: {
        ...localConfig?.settings,
        clusterNamespaces: namespaces,
      },
    });
  };

  const onChangeScanExcludes = (patterns: string[]) => {
    setLocalConfig({...localConfig, scanExcludes: patterns});
  };

  const onChangeHelmPreviewMode = (selectedHelmPreviewMode: any) => {
    if (selectedHelmPreviewMode === 'template' || selectedHelmPreviewMode === 'install') {
      setLocalConfig({...localConfig, settings: {...localConfig?.settings, helmPreviewMode: selectedHelmPreviewMode}});
    }
  };

  const onChangeHideExcludedFilesInFileExplorer = (e: any) => {
    setLocalConfig({
      ...localConfig,
      settings: {...localConfig?.settings, hideExcludedFilesInFileExplorer: e.target.checked},
    });
  };

  const onChangeKustomizeCommand = (selectedKustomizeCommand: any) => {
    if (selectedKustomizeCommand === 'kubectl' || selectedKustomizeCommand === 'kustomize') {
      setLocalConfig({
        ...localConfig,
        settings: {...localConfig?.settings, kustomizeCommand: selectedKustomizeCommand},
      });
    }
  };

  const setShouldIgnoreOptionalUnsatisfiedRefs = (e: any) => {
    dispatch(updateShouldOptionalIgnoreUnsatisfiedRefs(e.target.checked));
  };

  const onChangeEnableHelmWithKustomize = (e: any) => {
    setLocalConfig({
      ...localConfig,
      settings: {...localConfig?.settings, enableHelmWithKustomize: e.target.checked},
    });
  };
  const onChangeCreateDefaultObjects = (e: any) => {
    setLocalConfig({
      ...localConfig,
      settings: {...localConfig?.settings, createDefaultObjects: e.target.checked},
    });
  };
  const onChangeSetDefaultPrimitiveValues = (e: any) => {
    setLocalConfig({
      ...localConfig,
      settings: {...localConfig?.settings, setDefaultPrimitiveValues: e.target.checked},
    });
  };

  const openFileSelect = () => {
    if (isEditingDisabled) {
      return;
    }
    fileInput && fileInput.current?.click();
  };

  useDebounce(
    () => {
      if (currentKubeConfig !== localConfig?.kubeConfig?.path) {
        setLocalConfig({...localConfig, kubeConfig: {path: currentKubeConfig}});
      }
    },
    DEFAULT_KUBECONFIG_DEBOUNCE,
    [currentKubeConfig]
  );

  useDebounce(
    () => {
      if (currentProjectName !== projectName && onProjectNameChange) {
        onProjectNameChange(currentProjectName);
      }
    },
    DEFAULT_KUBECONFIG_DEBOUNCE,
    [currentProjectName]
  );

  const onUpdateKubeconfig = (e: any) => {
    if (isEditingDisabled) {
      return;
    }
    setCurrentKubeConfig(e.target.value);
  };

  const onSelectFile = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (fileInput.current?.files && fileInput.current.files.length > 0) {
      const file: any = fileInput.current.files[0];
      if (file.path) {
        const selectedFilePath = file.path;
        setCurrentKubeConfig(selectedFilePath);
      }
    }
  };

  const handleK8SVersionChange = (k8sVersion: string) => {
    setSelectedK8SVersion(k8sVersion);
    if (doesSchemaExist(k8sVersion)) {
      setLocalConfig({...localConfig, k8sVersion});
    }
  };

  const handleDownloadVersionSchema = async () => {
    try {
      setIsSchemaDownloading(true);
      await downloadSchema(
        `https://raw.githubusercontent.com/yannh/kubernetes-json-schema/master/v${selectedK8SVersion}/_definitions.json`,
        path.join(String(userDataDir), path.sep, 'schemas', `${selectedK8SVersion}.json`)
      );
      setIsSchemaDownloading(false);
      setLocalConfig({
        ...localConfig,
        k8sVersion: selectedK8SVersion,
      });
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error(error.message);
    }
  };

  const doesSchemaExist = useCallback(
    (k8sVersion: string) => {
      return schemaExists(path.join(String(userDataDir), path.sep, 'schemas', `${k8sVersion}.json`));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSchemaDownloading]
  );

  return (
    <>
      {showProjectName && (
        <Form
          form={settingsForm}
          initialValues={() => ({projectName})}
          autoComplete="off"
          onFieldsChange={(field, allFields) => {
            const name = allFields.filter(f => _.includes(f.name.toString(), 'projectName'))[0].value;
            setCurrentProjectName(name);
          }}
        >
          <>
            <S.Heading>Project Name</S.Heading>
            <Form.Item
              name="projectName"
              required
              tooltip="The name of your project throughout Monokle."
              rules={[
                {
                  required: true,
                  message: 'Please provide your project name!',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </>
        </Form>
      )}
      <S.Div>
        <S.Span>Kubernetes Version</S.Span>
        <div>
          <Tooltip title={TOOLTIP_K8S_SELECTION}>
            <Select
              value={selectedK8SVersion}
              onChange={handleK8SVersionChange}
              style={{width: doesSchemaExist(selectedK8SVersion) ? '100%' : 'calc(100% - 172px)'}}
              optionLabelProp="label"
              showSearch
            >
              {k8sVersions.map(version => (
                <Select.Option key={version} value={version} label={version}>
                  <S.OptionContainer>
                    <S.OptionLabel>{version}</S.OptionLabel>
                    {doesSchemaExist(version) && (
                      <S.OptionDownloadedText style={{color: 'green'}}>Downloaded</S.OptionDownloadedText>
                    )}
                  </S.OptionContainer>
                </Select.Option>
              ))}
            </Select>
          </Tooltip>

          {!doesSchemaExist(selectedK8SVersion) && (
            <Button
              style={{width: '160px', marginLeft: '12px'}}
              onClick={handleDownloadVersionSchema}
              loading={isSchemaDownloading}
            >
              Download & Use
            </Button>
          )}
        </div>
      </S.Div>
      <S.Div>
        <S.Heading>
          KUBECONFIG
          {isClusterActionDisabled && wasRehydrated && (
            <S.WarningOutlined
              className={isClusterPaneIconHighlighted ? 'animated-highlight' : ''}
              isKubeconfigPathValid={Boolean(config?.kubeConfig?.isPathValid)}
              highlighted={Boolean(isClusterPaneIconHighlighted)}
            />
          )}
        </S.Heading>
        <Tooltip title={KubeconfigPathTooltip}>
          <Input
            ref={inputRef}
            onClick={() => focusInput()}
            value={currentKubeConfig}
            onChange={onUpdateKubeconfig}
            disabled={isEditingDisabled}
          />
        </Tooltip>
        <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={BrowseKubeconfigTooltip} placement="right">
          <S.Button onClick={openFileSelect} disabled={isEditingDisabled}>
            Browse
          </S.Button>
        </Tooltip>
        <S.HiddenInput type="file" onChange={onSelectFile} ref={fileInput} />
      </S.Div>
      <S.Div>
        <S.Span>Files: Include</S.Span>
        <FilePatternList
          value={localConfig?.fileIncludes || []}
          onChange={onChangeFileIncludes}
          tooltip={AddInclusionPatternTooltip}
          isSettingsOpened={isSettingsOpened}
          showApplyButton={isScanIncludesUpdated === 'outdated'}
          onApplyClick={() => {
            dispatch(setRootFolder(filePath));
          }}
        />
      </S.Div>
      <S.Div>
        <S.Span>Files: Exclude</S.Span>
        <FilePatternList
          value={localConfig?.scanExcludes || []}
          onChange={onChangeScanExcludes}
          tooltip={AddExclusionPatternTooltip}
          isSettingsOpened={isSettingsOpened}
          showApplyButton={isScanExcludesUpdated === 'outdated'}
          onApplyClick={() => {
            dispatch(setRootFolder(filePath));
          }}
        />
      </S.Div>
      <S.Div>
        <Checkbox
          checked={Boolean(localConfig?.settings?.hideExcludedFilesInFileExplorer)}
          onChange={onChangeHideExcludedFilesInFileExplorer}
        >
          Hide excluded files
        </Checkbox>
      </S.Div>
      <S.Div>
        <S.Span>Helm Preview Mode</S.Span>
        <Tooltip title={HelmPreviewModeTooltip}>
          <Select value={localConfig?.settings?.helmPreviewMode} onChange={onChangeHelmPreviewMode}>
            <Select.Option value="template">Template</Select.Option>
            <Select.Option value="install">Install</Select.Option>
          </Select>
        </Tooltip>
      </S.Div>
      <S.Div>
        <S.Span>Kustomize Command</S.Span>
        <Tooltip title={KustomizeCommandTooltip}>
          <Select value={localConfig?.settings?.kustomizeCommand} onChange={onChangeKustomizeCommand}>
            <Select.Option value="kubectl">Use kubectl</Select.Option>
            <Select.Option value="kustomize">Use kustomize</Select.Option>
          </Select>
        </Tooltip>
      </S.Div>
      <S.Div>
        <Tooltip title={EnableHelmWithKustomizeTooltip}>
          <Checkbox checked={localConfig?.settings?.enableHelmWithKustomize} onChange={onChangeEnableHelmWithKustomize}>
            Enable Helm-related features when invoking Kustomize
          </Checkbox>
        </Tooltip>
      </S.Div>
      <S.Div>
        <S.Span>Maximum folder read recursion depth</S.Span>
        <InputNumber
          min={1}
          value={localConfig?.folderReadsMaxDepth}
          onChange={(value: number) => setLocalConfig({...localConfig, folderReadsMaxDepth: value})}
        />
      </S.Div>
      <S.Div>
        <S.Span>Resource links processing</S.Span>
        <Checkbox
          checked={resourceRefsProcessingOptions.shouldIgnoreOptionalUnsatisfiedRefs}
          onChange={setShouldIgnoreOptionalUnsatisfiedRefs}
        >
          Ignore optional unsatisfied links
        </Checkbox>
      </S.Div>
      <S.Div>
        <S.Span>Form Editor</S.Span>
        <S.Div>
          <Tooltip title="Automatically create default objects and values defined in the schema">
            <Checkbox checked={localConfig?.settings?.createDefaultObjects} onChange={onChangeCreateDefaultObjects}>
              Create default objects
            </Checkbox>
          </Tooltip>
        </S.Div>
        <S.Div>
          <Tooltip title="Automatically set default values defined in the schema">
            <Checkbox
              checked={localConfig?.settings?.setDefaultPrimitiveValues}
              onChange={onChangeSetDefaultPrimitiveValues}
            >
              Set default primitive values
            </Checkbox>
          </Tooltip>
        </S.Div>
      </S.Div>
      <S.Div>
        <S.Span>Namespaces</S.Span>
        <FilePatternList
          value={localConfig?.settings?.clusterNamespaces || []}
          onChange={onChangeNamespaces}
          tooltip={AddInclusionPatternTooltip}
          isSettingsOpened={isSettingsOpened}
          addButtonLabel="Add namespace"
        />
      </S.Div>
      {/* <StyledDiv>
        <StyledSpan>Theme</StyledSpan>
        <Radio.Group size="large" value={appConfig.settings.theme} onChange={onChangeTheme}>
          <Radio.Button value={Themes.Dark}>Dark</Radio.Button>
          <Radio.Button value={Themes.Light}>Light</Radio.Button>
        </Radio.Group>
      </StyledDiv>
      <StyledDiv>
        <StyledSpan>Text Size</StyledSpan>
        <Radio.Group size="large" value={appConfig.settings.textSize}>
          <Radio.Button value={TextSizes.Large}>Large</Radio.Button>
          <Radio.Button value={TextSizes.Medium}>Medium</Radio.Button>
          <Radio.Button value={TextSizes.Small}>Small</Radio.Button>
        </Radio.Group>
      </StyledDiv>
      <StyledDiv>
        <StyledSpan>Language</StyledSpan>
        <Radio.Group size="large" value={appConfig.settings.language}>
          <Space direction="vertical">
            <Radio value={Languages.English}>English</Radio>
          </Space>
        </Radio.Group>
      </StyledDiv> */}
    </>
  );
};
