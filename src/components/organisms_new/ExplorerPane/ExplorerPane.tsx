import {Collapse} from 'antd';

import styled from 'styled-components';

import FilePane from './FilePane';
import HelmConfigPane from './HelmConfigPane';
import HelmPane from './HelmPane/HelmPane';
import ImagePane from './ImagePane';
import KustomizePane from './KustomizePane';

export default function ExplorerPane() {
  return (
    <StyledCollapse accordion ghost>
      <FilePane key="files" />
      <HelmPane key="helm" />
      <HelmConfigPane key="helm-config" />
      <KustomizePane key="kustomize" />
      <ImagePane key="images" />
    </StyledCollapse>
  );
}

const StyledCollapse = styled(Collapse)`
  box-sizing: border-box;
  height: 100%;
  padding-top: 14px;
  padding-bottom: 14px;
  overflow: hidden;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;

  .ant-collapse-header {
    padding-top: 2px !important;
    padding-bottom: 0 !important;
  }
`;
