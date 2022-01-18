import * as k8s from '@kubernetes/client-node';

import React, {useEffect, useRef, useState} from 'react';
import {useDebounce} from 'react-use';

import {Button, Checkbox, Input, InputNumber, Select, Tooltip} from 'antd';

import {WarningOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {DEFAULT_EDITOR_DEBOUNCE, DEFAULT_KUBECONFIG_DEBOUNCE, TOOLTIP_DELAY} from '@constants/constants';
import {
  AddExclusionPatternTooltip,
  AddInclusionPatternTooltip,
  AutoLoadLastFolderTooltip,
  BrowseKubeconfigTooltip,
  EnableHelmWithKustomizeTooltip,
  HelmPreviewModeTooltip,
  KubeconfigPathTooltip,
  KustomizeCommandTooltip,
} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  setScanExcludesStatus,
  updateEnableHelmWithKustomize,
  updateFileIncludes,
  updateFolderReadsMaxDepth,
  updateHelmPreviewMode,
  updateHideExcludedFilesInFileExplorer,
  updateKubeconfig,
  updateKubeconfigPathValidity,
  updateKustomizeCommand,
  updateLoadLastFolderOnStartup,
  updateScanExcludes,
} from '@redux/reducers/appConfig';
import {updateShouldOptionalIgnoreUnsatisfiedRefs} from '@redux/reducers/main';
import {toggleClusterStatus, toggleSettings} from '@redux/reducers/ui';
import {isInClusterModeSelector} from '@redux/selectors';
import {loadContexts} from '@redux/thunks/loadKubeConfig';

// import {Themes, TextSizes, Languages} from '@models/appconfig';
import FilePatternList from '@molecules/FilePatternList';

import Drawer from '@components/atoms/Drawer';

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
  (props: {isKubeconfigPathValid: boolean; clusterPaneIconHighlighted: boolean; className: string}) => (
    <WarningOutlined className={props.className} />
  )
)`
  ${props =>
    `color: ${
      props.clusterPaneIconHighlighted
        ? Colors.whitePure
        : !props.isKubeconfigPathValid
        ? Colors.redError
        : Colors.yellowWarning
    }`};
  ${props => `margin-left: ${props.clusterPaneIconHighlighted ? '10px' : '5px'}`};
  ${props => `padding-top: ${props.clusterPaneIconHighlighted ? '5px' : '0px'}`};
`;

const StyledHeading = styled.h2`
  font-size: 16px;
  margin-bottom: 7px;
`;

const SettingsDrawer = () => {
  const dispatch = useAppDispatch();

  const isSettingsOpened = Boolean(useAppSelector(state => state.ui.isSettingsOpen));
  const resourceRefsProcessingOptions = useAppSelector(state => state.main.resourceRefsProcessingOptions);
  const appConfig = useAppSelector(state => state.config);
  const uiState = useAppSelector(state => state.ui);
  const kubeconfigPath = useAppSelector(state => state.config.kubeconfigPath);
  const isKubeconfigPathValid = useAppSelector(state => state.config.isKubeconfigPathValid);

  const folderReadsMaxDepth = useAppSelector(state => state.config.folderReadsMaxDepth);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const clusterStatusHidden = useAppSelector(state => state.ui.clusterStatusHidden);
  const [currentFolderReadsMaxDepth, setCurrentFolderReadsMaxDepth] = useState<number>(5);
  const [currentKubeConfig, setCurrentKubeConfig] = useState<string>('');
  const fileInput = useRef<HTMLInputElement>(null);
  const [inputRef, focusInput] = useFocus<Input>();
  const hasUserPerformedClickOnClusterIcon = useAppSelector(state => state.uiCoach.hasUserPerformedClickOnClusterIcon);
  const wasRehydrated = useAppSelector(state => state.main.wasRehydrated);
  const clusterPaneIconHighlighted = useAppSelector(state => state.ui.clusterPaneIconHighlighted);

  const isClusterActionDisabled = !kubeconfigPath || !isKubeconfigPathValid;

  const isEditingDisabled = uiState.isClusterDiffVisible || isInClusterMode;

  useEffect(() => {
    setCurrentFolderReadsMaxDepth(folderReadsMaxDepth);
  }, [folderReadsMaxDepth]);

  useDebounce(
    () => {
      if (currentFolderReadsMaxDepth !== folderReadsMaxDepth) {
        dispatch(updateFolderReadsMaxDepth(currentFolderReadsMaxDepth));
      }
    },
    DEFAULT_EDITOR_DEBOUNCE,
    [currentFolderReadsMaxDepth]
  );

  const toggleSettingsDrawer = () => {
    dispatch(toggleSettings());
  };

  const onChangeFileIncludes = (patterns: string[]) => {
    dispatch(updateFileIncludes(patterns));
  };

  const onChangeScanExcludes = (patterns: string[]) => {
    dispatch(updateScanExcludes(patterns));
    dispatch(setScanExcludesStatus('outdated'));
  };

  // const onChangeTheme = (e: RadioChangeEvent) => {
  //   if (e.target.value) {
  //     dispatch(updateTheme(e.target.value));
  //   }
  // };

  const onChangeHelmPreviewMode = (selectedHelmPreviewMode: any) => {
    if (selectedHelmPreviewMode === 'template' || selectedHelmPreviewMode === 'install') {
      dispatch(updateHelmPreviewMode(selectedHelmPreviewMode));
    }
  };

  const onChangeHideExcludedFilesInFileExplorer = (e: any) => {
    dispatch(updateHideExcludedFilesInFileExplorer(e.target.checked));
  };

  const onChangeKustomizeCommand = (selectedKustomizeCommand: any) => {
    if (selectedKustomizeCommand === 'kubectl' || selectedKustomizeCommand === 'kustomize') {
      dispatch(updateKustomizeCommand(selectedKustomizeCommand));
    }
  };

  const onChangeEnableHelmWithKustomize = (e: any) => {
    dispatch(updateEnableHelmWithKustomize(e.target.checked));
  };

  const onChangeLoadLastFolderOnStartup = (e: any) => {
    dispatch(updateLoadLastFolderOnStartup(e.target.checked));
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

  useEffect(() => {
    setCurrentKubeConfig(kubeconfigPath);
  }, [kubeconfigPath]);

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
      try {
        const kc = new k8s.KubeConfig();

        kc.loadFromFile(currentKubeConfig);

        dispatch(updateKubeconfigPathValidity(Boolean(kc.contexts) || false));
      } catch (err) {
        dispatch(updateKubeconfigPathValidity(!currentKubeConfig.length));
      } finally {
        dispatch(updateKubeconfig(currentKubeConfig));
      }
    },
    DEFAULT_KUBECONFIG_DEBOUNCE,
    [currentKubeConfig, kubeconfigPath]
  );

  useEffect(() => {
    if (kubeconfigPath) {
      loadContexts(kubeconfigPath, dispatch);
    }
  }, [kubeconfigPath, dispatch]);

  const onUpdateKubeconfig = (e: any) => {
    if (isEditingDisabled) {
      return;
    }
    let value = e.target.value;
    setCurrentKubeConfig(value);
  };

  const onSelectFile = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (fileInput.current?.files && fileInput.current.files.length > 0) {
      const file: any = fileInput.current.files[0];
      if (file.path) {
        const path = file.path;
        dispatch(updateKubeconfig(path));
      }
    }
  };

  const toggleClusterSelector = () => {
    dispatch(toggleClusterStatus());
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
    >
      <StyledDiv>
        <StyledHeading>
          KUBECONFIG
          {isClusterActionDisabled && hasUserPerformedClickOnClusterIcon && wasRehydrated && (
            <StyledWarningOutlined
              className={clusterPaneIconHighlighted ? 'animated-highlight' : ''}
              isKubeconfigPathValid={isKubeconfigPathValid}
              clusterPaneIconHighlighted={clusterPaneIconHighlighted}
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
          <Checkbox checked={!clusterStatusHidden} onChange={toggleClusterSelector}>
            Show Cluster Selector
          </Checkbox>
        </StyledDiv>
        <HiddenInput type="file" onChange={onSelectFile} ref={fileInput} />
      </StyledDiv>
      <StyledDiv>
        <StyledSpan>Files: Include</StyledSpan>
        <FilePatternList
          value={appConfig.fileIncludes}
          onChange={onChangeFileIncludes}
          tooltip={AddInclusionPatternTooltip}
          isSettingsOpened={isSettingsOpened}
        />
      </StyledDiv>
      <StyledDiv>
        <StyledSpan>Files: Exclude</StyledSpan>
        <FilePatternList
          value={appConfig.scanExcludes}
          onChange={onChangeScanExcludes}
          tooltip={AddExclusionPatternTooltip}
          isSettingsOpened={isSettingsOpened}
          type="excludes"
        />
      </StyledDiv>
      <StyledDiv>
        <Checkbox
          checked={appConfig.settings.hideExcludedFilesInFileExplorer}
          onChange={onChangeHideExcludedFilesInFileExplorer}
        >
          Hide excluded files
        </Checkbox>
      </StyledDiv>
      <StyledDiv>
        <StyledSpan>Helm Preview Mode</StyledSpan>
        <Tooltip title={HelmPreviewModeTooltip}>
          <StyledSelect value={appConfig.settings.helmPreviewMode} onChange={onChangeHelmPreviewMode}>
            <Select.Option value="template">Template</Select.Option>
            <Select.Option value="install">Install</Select.Option>
          </StyledSelect>
        </Tooltip>
      </StyledDiv>
      <StyledDiv>
        <StyledSpan>Kustomize Command</StyledSpan>
        <Tooltip title={KustomizeCommandTooltip}>
          <StyledSelect value={appConfig.settings.kustomizeCommand} onChange={onChangeKustomizeCommand}>
            <Select.Option value="kubectl">Use kubectl</Select.Option>
            <Select.Option value="kustomize">Use kustomize</Select.Option>
          </StyledSelect>
        </Tooltip>
      </StyledDiv>
      <StyledDiv>
        <Tooltip title={EnableHelmWithKustomizeTooltip}>
          <Checkbox checked={appConfig.settings.enableHelmWithKustomize} onChange={onChangeEnableHelmWithKustomize}>
            Enable Helm-related features when invoking Kustomize
          </Checkbox>
        </Tooltip>
      </StyledDiv>
      <StyledDiv>
        <StyledSpan>On Startup</StyledSpan>
        <Tooltip title={AutoLoadLastFolderTooltip}>
          <Checkbox checked={appConfig.settings.loadLastFolderOnStartup} onChange={onChangeLoadLastFolderOnStartup}>
            Automatically load last folder
          </Checkbox>
        </Tooltip>
      </StyledDiv>
      <StyledDiv>
        <StyledSpan>Maximum folder read recursion depth</StyledSpan>
        <InputNumber min={1} value={currentFolderReadsMaxDepth} onChange={setCurrentFolderReadsMaxDepth} />
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
    </Drawer>
  );
};

export default SettingsDrawer;
