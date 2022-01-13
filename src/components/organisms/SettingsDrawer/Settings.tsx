import React, {useEffect, useRef, useState} from 'react';
import {useDebounce} from 'react-use';

import {Button, Checkbox, Input, InputNumber, Select, Tooltip} from 'antd';

import {WarningOutlined} from '@ant-design/icons';

import _ from 'lodash';
import styled from 'styled-components';

import {DEFAULT_EDITOR_DEBOUNCE, DEFAULT_KUBECONFIG_DEBOUNCE, TOOLTIP_DELAY} from '@constants/constants';
import {
  AddExclusionPatternTooltip,
  AddInclusionPatternTooltip,
  AutoLoadLastProjectTooltip,
  BrowseKubeconfigTooltip,
  HelmPreviewModeTooltip,
  KubeconfigPathTooltip,
  KustomizeCommandTooltip,
} from '@constants/tooltips';

import {ProjectConfig} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateShouldOptionalIgnoreUnsatisfiedRefs} from '@redux/reducers/main';
import {isInClusterModeSelector} from '@redux/selectors';

import FilePatternList from '@molecules/FilePatternList';

// import {Themes, TextSizes, Languages} from '@models/appconfig';
import {useFocus} from '@utils/hooks';

import Colors from '@styles/Colors';

const StyledDiv = styled.div`
  margin-bottom: 20px;
`;

const StyledSpan = styled.span`
  font-weight: 500;
  font-size: 20px;
  display: block;
  margin-bottom: 6px;
`;

const StyledButton = styled(Button)`
  margin-top: 10px;
`;

const HiddenInput = styled.input`
  display: none;
`;

const StyledSelect = styled(Select)`
  width: 100%;
`;

const StyledWarningOutlined = styled(
  (props: {isKubeconfigPathValid: boolean; highlighted?: boolean; className: string}) => (
    <WarningOutlined className={props.className} />
  )
)`
  ${props =>
    `color: ${
      props.highlighted ? Colors.whitePure : !props.isKubeconfigPathValid ? Colors.redError : Colors.yellowWarning
    }`};
  ${props => `margin-left: ${props.highlighted ? '10px' : '5px'}`};
  ${props => `padding-top: ${props.highlighted ? '5px' : '0px'}`};
`;

const StyledHeading = styled.h2`
  font-size: 16px;
  margin-bottom: 7px;
`;

type SettingsProps = {
  config?: ProjectConfig | null;
  onConfigChange?: Function;
  isClusterPaneIconHighlighted?: boolean | null;
  showLoadLastProjectOnStartup?: boolean | null;
};

export const Settings = ({
  config,
  onConfigChange,
  isClusterPaneIconHighlighted,
  showLoadLastProjectOnStartup,
}: SettingsProps) => {
  const dispatch = useAppDispatch();
  const isSettingsOpened = Boolean(useAppSelector(state => state.ui.isSettingsOpen));

  const resourceRefsProcessingOptions = useAppSelector(state => state.main.resourceRefsProcessingOptions);
  const uiState = useAppSelector(state => state.ui);

  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const fileInput = useRef<HTMLInputElement>(null);
  const [inputRef, focusInput] = useFocus<Input>();
  const hasUserPerformedClickOnClusterIcon = useAppSelector(state => state.uiCoach.hasUserPerformedClickOnClusterIcon);
  const wasRehydrated = useAppSelector(state => state.main.wasRehydrated);
  const [isClusterActionDisabled, setIsClusterActionDisabled] = useState(
    Boolean(!config?.kubeConfig?.path) || Boolean(!config?.kubeConfig?.isPathValid)
  );
  const [currentKubeConfig, setCurrentKubeConfig] = useState(config?.kubeConfig?.path);
  const isEditingDisabled = uiState.isClusterDiffVisible || isInClusterMode;

  const [localConfig, setLocalConfig] = useState<ProjectConfig | null | undefined>(config);

  const handleConfigChange = () => {
    if (onConfigChange && !_.isEqual(localConfig, config)) {
      onConfigChange(localConfig);
    }
  };

  useEffect(() => {
    setIsClusterActionDisabled(Boolean(!config?.kubeConfig?.path) || Boolean(!config?.kubeConfig?.isPathValid));
  }, [config?.kubeConfig]);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  useEffect(() => {
    handleConfigChange();
  }, [localConfig]);

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

  const onChangeScanExcludes = (patterns: string[]) => {
    setLocalConfig({...localConfig, scanExcludes: patterns});
  };

  // const onChangeTheme = (e: RadioChangeEvent) => {
  //   if (e.target.value) {
  //     dispatch(updateTheme(e.target.value));
  //   }
  // };

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

  const onChangeLoadLastFolderOnStartup = (e: any) => {
    setLocalConfig({
      ...localConfig,
      settings: {...localConfig?.settings, loadLastProjectOnStartup: e.target.checked},
    });
  };

  const setShouldIgnoreOptionalUnsatisfiedRefs = (e: any) => {
    dispatch(updateShouldOptionalIgnoreUnsatisfiedRefs(e.target.checked));
  };

  const openFileSelect = () => {
    if (isEditingDisabled) {
      return;
    }
    fileInput && fileInput.current?.click();
  };

  // useDebounce(
  //   () => {
  //     if (currentKubeConfig !== kubeconfigPath) {
  //       dispatch(updateKubeconfig(currentKubeConfig));
  //     }
  //   },
  //   DEFAULT_KUBECONFIG_DEBOUNCE,
  //   [currentKubeConfig]
  // );

  useDebounce(
    () => {
      if (currentKubeConfig !== localConfig?.kubeConfig?.path) {
        setLocalConfig({...localConfig, kubeConfig: {path: currentKubeConfig}});
      }
    },
    DEFAULT_KUBECONFIG_DEBOUNCE,
    [currentKubeConfig]
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
        const path = file.path;
        setLocalConfig({...localConfig, kubeConfig: {path}});
      }
    }
  };

  const toggleClusterSelector = () => {
    setLocalConfig({
      ...localConfig,
      settings: {
        ...localConfig?.settings,
        isClusterSelectorVisible: Boolean(!localConfig?.settings?.isClusterSelectorVisible),
      },
    });
  };
  return (
    <>
      <StyledDiv>
        <StyledHeading>
          KUBECONFIG
          {isClusterActionDisabled && hasUserPerformedClickOnClusterIcon && wasRehydrated && (
            <StyledWarningOutlined
              className={isClusterPaneIconHighlighted ? 'animated-highlight' : ''}
              isKubeconfigPathValid={Boolean(config?.kubeConfig?.isPathValid)}
              highlighted={Boolean(isClusterPaneIconHighlighted)}
            />
          )}
        </StyledHeading>
        <Tooltip title={KubeconfigPathTooltip}>
          <Input
            ref={inputRef}
            value={currentKubeConfig}
            onChange={onUpdateKubeconfig}
            disabled={isEditingDisabled}
            onClick={() => focusInput()}
          />
        </Tooltip>
        <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={BrowseKubeconfigTooltip} placement="right">
          <StyledButton onClick={openFileSelect} disabled={isEditingDisabled}>
            Browse
          </StyledButton>
        </Tooltip>
        <StyledDiv style={{marginTop: 16}}>
          <Checkbox checked={Boolean(localConfig?.settings?.isClusterSelectorVisible)} onChange={toggleClusterSelector}>
            Show Cluster Selector
          </Checkbox>
        </StyledDiv>
        <HiddenInput type="file" onChange={onSelectFile} ref={fileInput} />
      </StyledDiv>
      <StyledDiv>
        <StyledSpan>Files: Include</StyledSpan>
        <FilePatternList
          value={localConfig?.fileIncludes || []}
          onChange={onChangeFileIncludes}
          tooltip={AddInclusionPatternTooltip}
          isSettingsOpened={isSettingsOpened}
        />
      </StyledDiv>
      <StyledDiv>
        <StyledSpan>Files: Exclude</StyledSpan>
        <FilePatternList
          value={localConfig?.scanExcludes || []}
          onChange={onChangeScanExcludes}
          tooltip={AddExclusionPatternTooltip}
          isSettingsOpened={isSettingsOpened}
          type="excludes"
        />
      </StyledDiv>
      <StyledDiv>
        <Checkbox
          checked={Boolean(localConfig?.settings?.hideExcludedFilesInFileExplorer)}
          onChange={onChangeHideExcludedFilesInFileExplorer}
        >
          Hide excluded files
        </Checkbox>
      </StyledDiv>
      <StyledDiv>
        <StyledSpan>Helm Preview Mode</StyledSpan>
        <Tooltip title={HelmPreviewModeTooltip}>
          <StyledSelect value={localConfig?.settings?.helmPreviewMode} onChange={onChangeHelmPreviewMode}>
            <Select.Option value="template">Template</Select.Option>
            <Select.Option value="install">Install</Select.Option>
          </StyledSelect>
        </Tooltip>
      </StyledDiv>
      <StyledDiv>
        <StyledSpan>Kustomize Command</StyledSpan>
        <Tooltip title={KustomizeCommandTooltip}>
          <StyledSelect value={localConfig?.settings?.kustomizeCommand} onChange={onChangeKustomizeCommand}>
            <Select.Option value="kubectl">Use kubectl</Select.Option>
            <Select.Option value="kustomize">Use kustomize</Select.Option>
          </StyledSelect>
        </Tooltip>
      </StyledDiv>
      {showLoadLastProjectOnStartup && (
        <StyledDiv>
          <StyledSpan>On Startup</StyledSpan>
          <Tooltip title={AutoLoadLastProjectTooltip}>
            <Checkbox
              checked={Boolean(localConfig?.settings?.loadLastProjectOnStartup)}
              onChange={onChangeLoadLastFolderOnStartup}
            >
              Automatically load last project
            </Checkbox>
          </Tooltip>
        </StyledDiv>
      )}
      <StyledDiv>
        <StyledSpan>Maximum folder read recursion depth</StyledSpan>
        <InputNumber
          min={1}
          value={localConfig?.folderReadsMaxDepth}
          onChange={(value: number) => setLocalConfig({...localConfig, folderReadsMaxDepth: value})}
        />
      </StyledDiv>
      <StyledDiv>
        <StyledSpan>Resource links processing</StyledSpan>
        <Checkbox
          checked={resourceRefsProcessingOptions.shouldIgnoreOptionalUnsatisfiedRefs}
          onChange={setShouldIgnoreOptionalUnsatisfiedRefs}
        >
          Ignore optional unsatisfied links
        </Checkbox>
      </StyledDiv>
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
