import {Collapse as RawCollapse} from 'antd';

import styled from 'styled-components';

import FilePane from './FilePane';
import KustomizePane from './KustomizePane';

const ExplorerPane: React.FC = () => {
  return (
    <Collapse accordion ghost>
      <FilePane key="files" />
      <KustomizePane key="kustomize" />
    </Collapse>
  );
};

export default ExplorerPane;

const Collapse = styled(RawCollapse)`
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
