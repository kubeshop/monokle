import {Collapse as RawCollapse} from 'antd';

import styled from 'styled-components';

import {trackEvent} from '@shared/utils/telemetry';

import FilePane from './FilePane';
import HelmPane from './HelmPane';
import ImagesPane from './ImagesPane';
import KustomizePane from './KustomizePane';

const ExplorerPane: React.FC = () => {
  return (
    <Collapse
      accordion
      ghost
      defaultActiveKey="files"
      onChange={key => {
        trackEvent('accordion/select-panel', {panelKey: key as string});
      }}
    >
      <FilePane key="files" />
      <KustomizePane key="kustomize" />
      <HelmPane key="helm" />
      <ImagesPane key="images" />
    </Collapse>
  );
};

export default ExplorerPane;

const Collapse = styled(RawCollapse)`
  padding-top: 8px;
  box-sizing: border-box;
  height: 100%;
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
