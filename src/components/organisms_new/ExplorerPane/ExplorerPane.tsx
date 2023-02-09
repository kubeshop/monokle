import {Collapse as RawCollapse} from 'antd';

import styled from 'styled-components';

import FilePane from './FilePane';
import HelmPane from './HelmPane';
import ImagesPane from './ImagesPane';
import KustomizePane from './KustomizePane';

const ExplorerPane: React.FC = () => {
  return (
    <Collapse accordion ghost defaultActiveKey="files">
      <FilePane panelKey="files" />
      <KustomizePane panelKey="kustomize" />
      <HelmPane panelKey="helm" />
      <ImagesPane panelKey="images" />
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
