import React, {useRef} from 'react';
import styled from 'styled-components';

import {Button, Input, Select} from 'antd';

// import {Themes, TextSizes, Languages} from '@models/appconfig';

import FilePatternList from '@molecules/FilePatternList';

import {useAppSelector, useAppDispatch} from '@redux/hooks';
import {toggleSettings} from '@redux/reducers/ui';
import {
  updateScanExcludes,
  updateFileIncludes,
  updateKubeconfig,
  updateHelmPreviewMode,
} from '@redux/reducers/appConfig';
import Drawer from '@components/atoms/Drawer';

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
  const isSettingsOpened = Boolean(useAppSelector(state => state.ui.settingsOpened));

  const appConfig = useAppSelector(state => state.config);

  const fileInput = useRef<HTMLInputElement>(null);

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
        <Input value={appConfig.kubeconfig} />
        <StyledButton onClick={openFileSelect}>Browse</StyledButton>
        <HiddenInput type="file" onChange={onSelectFile} ref={fileInput} />
      </StyledDiv>
      <StyledDiv>
        <StyledSpan>Files: Include</StyledSpan>
        <FilePatternList value={appConfig.fileIncludes} onChange={onChangeFileIncludes} />
      </StyledDiv>
      <StyledDiv>
        <StyledSpan>Files: Exclude</StyledSpan>
        <FilePatternList value={appConfig.scanExcludes} onChange={onChangeScanExcludes} />
      </StyledDiv>
      <StyledDiv>
        <StyledSpan>Helm Preview Mode</StyledSpan>
        <StyledSelect value={appConfig.settings.helmPreviewMode} onChange={onChangeHelmPreviewMode}>
          <Select.Option value="template">Template</Select.Option>
          <Select.Option value="install">Install</Select.Option>
        </StyledSelect>
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
    </Drawer>
  );
};

export default SettingsDrawer;
