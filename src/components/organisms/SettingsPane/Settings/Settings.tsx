import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useDebounce} from 'react-use';

import {Button, Checkbox, Form, Input, InputNumber, InputRef, Select, Tooltip} from 'antd';
import {CheckboxChangeEvent} from 'antd/lib/checkbox';
import {useForm} from 'antd/lib/form/Form';

import _ from 'lodash';
import log from 'loglevel';

import {
  DEFAULT_EDITOR_DEBOUNCE,
  DEFAULT_KUBECONFIG_DEBOUNCE,
  TOOLTIP_DELAY,
  TOOLTIP_K8S_SELECTION,
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

import {isInClusterModeSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {downloadK8sSchema} from '@redux/thunks/downloadK8sSchema';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {FilePatternList} from '@atoms';

import {useFocus, useStateWithRef} from '@utils/hooks';
import {doesSchemaExist} from '@utils/index';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {K8S_VERSIONS} from '@shared/constants/k8s';
import {ProjectConfig} from '@shared/models/config';
import {isEqual} from '@shared/utils/isEqual';

import * as S from './Settings.styled';

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

  const isScanIncludesUpdated = useAppSelector(state => state.config.isScanIncludesUpdated);
  const isScanExcludesUpdated = useAppSelector(state => state.config.isScanExcludesUpdated);
  const filePath = useAppSelector(state => state.main.fileMap[ROOT_FILE_ENTRY]?.filePath);
  const [isKubeConfigBrowseSettingsOpen, setIsKubeConfigBrowseSettingsOpen] = useState(false);

  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const fileInput = useRef<HTMLInputElement>(null);
  const [inputRef, focusInput] = useFocus<InputRef>();
  const wasRehydrated = useAppSelector(state => state.main.wasRehydrated);
  const [isClusterActionDisabled, setIsClusterActionDisabled] = useState(
    Boolean(!config?.kubeConfig?.path) || Boolean(!config?.kubeConfig?.isPathValid)
  );
  const [currentKubeConfig, setCurrentKubeConfig] = useState(config?.kubeConfig?.path);
  const [currentProjectName, setCurrentProjectName] = useState(projectName);
  const isEditingDisabled = isInClusterMode;
  const [k8sVersions] = useState<Array<string>>(K8S_VERSIONS);
  const userDataDir = useAppSelector(state => state.config.userDataDir);
  const [selectedK8SVersion, setSelectedK8SVersion] = useState<string>(String(config?.k8sVersion));
  const [isSchemaDownloading, setIsSchemaDownloading] = useState<boolean>(false);
  const [localConfig, setLocalConfig, localConfigRef] = useStateWithRef<ProjectConfig | null | undefined>(config);

  const handleConfigChange = useCallback(() => {
    if (onConfigChange && !isEqual(localConfigRef.current, config)) {
      onConfigChange(localConfig);
    }
  }, [config, localConfig, localConfigRef, onConfigChange]);

  useEffect(() => {
    setIsClusterActionDisabled(Boolean(!config?.kubeConfig?.path) || Boolean(!config?.kubeConfig?.isPathValid));
    setCurrentKubeConfig(config?.kubeConfig?.path);
    setIsKubeConfigBrowseSettingsOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.kubeConfig]);

  useEffect(() => {
    // If config prop is changed externally, This code will make localConfig even with config prop
    setLocalConfig(config);
    setSelectedK8SVersion(String(config?.k8sVersion));
    setIsKubeConfigBrowseSettingsOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  useEffect(() => {
    handleConfigChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleConfigChange, localConfig]);

  useEffect(() => {
    settingsForm.setFieldsValue({projectName});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectName]);

  useDebounce(
    () => {
      handleConfigChange();
    },
    DEFAULT_EDITOR_DEBOUNCE,
    [handleConfigChange, localConfig?.folderReadsMaxDepth]
  );

  const onChangeFileIncludes = (patterns: string[]) => {
    setLocalConfig({...localConfig, fileIncludes: patterns});
  };

  const onChangeScanExcludes = (patterns: string[]) => {
    setLocalConfig({...localConfig, scanExcludes: patterns});
  };

  const onChangeHelmPreviewMode = (selectedHelmPreviewMode: any) => {
    if (selectedHelmPreviewMode === 'template' || selectedHelmPreviewMode === 'install') {
      setLocalConfig({...localConfig, settings: {...localConfig?.settings, helmPreviewMode: selectedHelmPreviewMode}});
    }
  };

  const onChangeHideExcludedFilesInFileExplorer = (e: CheckboxChangeEvent) => {
    setLocalConfig({
      ...localConfig,
      settings: {...localConfig?.settings, hideExcludedFilesInFileExplorer: e.target.checked},
    });
  };

  const onChangeHideUnsupportedFilesInFileExplorer = (e: CheckboxChangeEvent) => {
    setLocalConfig({
      ...localConfig,
      settings: {...localConfig?.settings, hideUnsupportedFilesInFileExplorer: e.target.checked},
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

  // TODO: revisit this after @monokle/validation is integrated
  // const setShouldIgnoreOptionalUnsatisfiedRefs = (e: any) => {
  //   dispatch(updateShouldOptionalIgnoreUnsatisfiedRefs(e.target.checked));
  // };

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

  const onChangeAllowEditInClusterMode = (e: any) => {
    setLocalConfig({
      ...localConfig,
      settings: {...localConfig?.settings, allowEditInClusterMode: e.target.checked},
    });
  };

  const onChangeHideEditorPlaceholder = (e: any) => {
    setLocalConfig({
      ...localConfig,
      settings: {...localConfig?.settings, hideEditorPlaceholder: e.target.checked},
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
    setIsKubeConfigBrowseSettingsOpen(false);
  };

  const onSelectFile = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (fileInput.current?.files && fileInput.current.files.length > 0) {
      const file: any = fileInput.current.files[0];
      if (file.path) {
        const selectedFilePath = file.path;
        setCurrentKubeConfig(selectedFilePath);
        setIsKubeConfigBrowseSettingsOpen(false);
      }
    }
  };

  const handleK8SVersionChange = (k8sVersion: string) => {
    setSelectedK8SVersion(k8sVersion);
    if (doesSchemaExist(k8sVersion, String(userDataDir))) {
      setLocalConfig({...localConfig, k8sVersion});
    }
  };

  const handleDownloadVersionSchema = async () => {
    try {
      setIsSchemaDownloading(true);
      await dispatch(downloadK8sSchema(selectedK8SVersion)).unwrap();

      setIsSchemaDownloading(false);
      setLocalConfig({
        ...localConfig,
        k8sVersion: selectedK8SVersion,
      });
    } catch (error: any) {
      log.error(error.message);
    }
  };

  return (
    <S.SettingsContainer>
      <S.SettingsColumnContainer>
        {showProjectName && (
          <Form
            form={settingsForm}
            initialValues={() => ({projectName})}
            autoComplete="off"
            onFieldsChange={(field, allFields) => {
              const name = allFields.filter((f: any) => _.includes(f.name.toString(), 'projectName'))[0].value;
              setCurrentProjectName(name);
            }}
          >
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
          </Form>
        )}
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

          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={KubeconfigPathTooltip}>
            <Input.Search
              ref={inputRef}
              onClick={() => focusInput()}
              value={currentKubeConfig}
              onChange={onUpdateKubeconfig}
              disabled={isEditingDisabled}
              loading={!isKubeConfigBrowseSettingsOpen}
            />
          </Tooltip>

          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={BrowseKubeconfigTooltip} placement="right">
            <S.Button onClick={openFileSelect} disabled={isEditingDisabled || !isKubeConfigBrowseSettingsOpen}>
              Browse
            </S.Button>
          </Tooltip>
          <S.HiddenInput type="file" onChange={onSelectFile} ref={fileInput} />
        </S.Div>

        <S.Div>
          <S.Span>Kubernetes Version</S.Span>
          <div>
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={TOOLTIP_K8S_SELECTION}>
              <Select
                value={selectedK8SVersion}
                onChange={handleK8SVersionChange}
                style={{
                  width: doesSchemaExist(selectedK8SVersion, String(userDataDir)) ? '100%' : 'calc(100% - 172px)',
                }}
                optionLabelProp="label"
                showSearch
              >
                {k8sVersions.map(version => (
                  <Select.Option key={version} value={version} label={version}>
                    <S.OptionContainer>
                      <S.OptionLabel>{version}</S.OptionLabel>
                      {doesSchemaExist(version, String(userDataDir)) && (
                        <S.OptionDownloadedText style={{color: 'green'}}>Downloaded</S.OptionDownloadedText>
                      )}
                    </S.OptionContainer>
                  </Select.Option>
                ))}
              </Select>
            </Tooltip>

            {!doesSchemaExist(selectedK8SVersion, String(userDataDir)) && (
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
          <S.Span>Files: Include</S.Span>
          <FilePatternList
            value={localConfig?.fileIncludes || []}
            onChange={onChangeFileIncludes}
            tooltip={AddInclusionPatternTooltip}
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
          <Checkbox
            checked={Boolean(localConfig?.settings?.hideUnsupportedFilesInFileExplorer)}
            onChange={onChangeHideUnsupportedFilesInFileExplorer}
          >
            Hide unsupported files
          </Checkbox>
        </S.Div>
      </S.SettingsColumnContainer>
      <S.SettingsColumnContainer>
        <S.Div>
          <S.Span>Helm Preview Mode</S.Span>
          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={HelmPreviewModeTooltip}>
            <Select
              style={{width: '100%'}}
              value={localConfig?.settings?.helmPreviewMode}
              onChange={onChangeHelmPreviewMode}
            >
              <Select.Option value="template">Template</Select.Option>
              <Select.Option value="install">Install</Select.Option>
            </Select>
          </Tooltip>
        </S.Div>
        <S.Div>
          <S.Span>Kustomize Command</S.Span>
          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={KustomizeCommandTooltip}>
            <Select
              style={{width: '100%'}}
              dropdownMatchSelectWidth={false}
              value={localConfig?.settings?.kustomizeCommand}
              onChange={onChangeKustomizeCommand}
            >
              <Select.Option value="kubectl">Use kubectl</Select.Option>
              <Select.Option value="kustomize">Use kustomize</Select.Option>
            </Select>
          </Tooltip>
        </S.Div>
        <S.Div>
          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={EnableHelmWithKustomizeTooltip}>
            <Checkbox
              checked={localConfig?.settings?.enableHelmWithKustomize}
              onChange={onChangeEnableHelmWithKustomize}
            >
              Enable Helm-related features when invoking Kustomize
            </Checkbox>
          </Tooltip>
        </S.Div>
        <S.Div>
          <S.Span>Maximum folder read recursion depth</S.Span>
          <InputNumber
            min={1}
            value={localConfig?.folderReadsMaxDepth}
            onChange={(value: number | null) => {
              if (!value) {
                return;
              }

              setLocalConfig({...localConfig, folderReadsMaxDepth: value});
            }}
          />
        </S.Div>
        {/* <S.Div>
          <S.Span>Resource links processing</S.Span> */}

        {/*
            // TODO: revisit this after @monokle/validation is integrated
          <Checkbox
            checked={resourceRefsProcessingOptions.shouldIgnoreOptionalUnsatisfiedRefs}
            onChange={setShouldIgnoreOptionalUnsatisfiedRefs}
          >
            Ignore optional unsatisfied links
          </Checkbox> */}
        {/* </S.Div> */}
        <S.Div>
          <S.Span>Form Editor</S.Span>
          <S.Div>
            <Tooltip
              mouseEnterDelay={TOOLTIP_DELAY}
              title="Automatically create default objects and values defined in the schema"
            >
              <Checkbox checked={localConfig?.settings?.createDefaultObjects} onChange={onChangeCreateDefaultObjects}>
                Create default objects
              </Checkbox>
            </Tooltip>
          </S.Div>
          <S.Div>
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title="Automatically set default values defined in the schema">
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
          <S.Span>Cluster Mode</S.Span>
          <Checkbox checked={localConfig?.settings?.allowEditInClusterMode} onChange={onChangeAllowEditInClusterMode}>
            Allow editing resources
          </Checkbox>
        </S.Div>
        <S.Div>
          <S.Span>UI Preferences</S.Span>
          <Checkbox checked={localConfig?.settings?.hideEditorPlaceholder} onChange={onChangeHideEditorPlaceholder}>
            Hide Editor Placeholder
          </Checkbox>
        </S.Div>
      </S.SettingsColumnContainer>
    </S.SettingsContainer>
  );
};
