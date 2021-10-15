import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';

import {Button, Input, Select, Tooltip, Divider, Checkbox, InputNumber} from 'antd';

// import {Themes, TextSizes, Languages} from '@models/appconfig';

import FilePatternList from '@molecules/FilePatternList';

import {useAppSelector, useAppDispatch} from '@redux/hooks';
import {toggleSettings} from '@redux/reducers/ui';
import {updateShouldOptionalIgnoreUnsatisfiedRefs} from '@redux/reducers/main';
import {
  updateScanExcludes,
  updateFileIncludes,
  updateKubeconfig,
  updateHelmPreviewMode,
  updateLoadLastFolderOnStartup,
  updateFolderReadsMaxDepth,
} from '@redux/reducers/appConfig';
import Drawer from '@components/atoms/Drawer';
import {
  AddExclusionPatternTooltip,
  AddInclusionPatternTooltip,
  AutoLoadLastFolderTooltip,
  HelmPreviewModeTooltip,
  KubeconfigPathTooltip,
} from '@constants/tooltips';
import {ipcRenderer} from 'electron';
import {useDebounce} from 'react-use';

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

const SettingsDrawer = () => {
  const dispatch = useAppDispatch();
  const isSettingsOpened = Boolean(useAppSelector(state => state.ui.isSettingsOpen));

  const resourceRefsProcessingOptions = useAppSelector(state => state.main.resourceRefsProcessingOptions);
  const appConfig = useAppSelector(state => state.config);
  const folderReadsMaxDepth = useAppSelector(state => state.config.folderReadsMaxDepth);
  const [currentFolderReadsMaxDepth, setCurrentFolderReadsMaxDepth] = useState<number>(5);

  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentFolderReadsMaxDepth(folderReadsMaxDepth);
  }, [folderReadsMaxDepth]);

  useDebounce(
    () => {
      if (currentFolderReadsMaxDepth !== folderReadsMaxDepth) {
        dispatch(updateFolderReadsMaxDepth(currentFolderReadsMaxDepth));
      }
    },
    500,
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

  const onChangeLoadLastFolderOnStartup = (e: any) => {
    dispatch(updateLoadLastFolderOnStartup(e.target.checked));
  };

  const setShouldIgnoreOptionalUnsatisfiedRefs = (e: any) => {
    dispatch(updateShouldOptionalIgnoreUnsatisfiedRefs(e.target.checked));
  };

  const openFileSelect = () => {
    fileInput && fileInput.current?.click();
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

  const checkUpdateAvailability = () => {
    ipcRenderer.send('check-update-available');
  };

  const updateApplication = () => {
    ipcRenderer.send('quit-and-install');
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
        <StyledSpan>KUBECONFIG</StyledSpan>
        <Tooltip title={KubeconfigPathTooltip}>
          <Input defaultValue={appConfig.kubeconfigPath} />
        </Tooltip>
        <StyledButton onClick={openFileSelect}>Browse</StyledButton>
        <HiddenInput type="file" onChange={onSelectFile} ref={fileInput} />
      </StyledDiv>
      <StyledDiv>
        <StyledSpan>Files: Include</StyledSpan>
        <FilePatternList
          value={appConfig.fileIncludes}
          onChange={onChangeFileIncludes}
          tooltip={AddInclusionPatternTooltip}
        />
      </StyledDiv>
      <StyledDiv>
        <StyledSpan>Files: Exclude</StyledSpan>
        <FilePatternList
          value={appConfig.scanExcludes}
          onChange={onChangeScanExcludes}
          tooltip={AddExclusionPatternTooltip}
        />
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
      <Divider />
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
    </Drawer>
  );
};

export default SettingsDrawer;
