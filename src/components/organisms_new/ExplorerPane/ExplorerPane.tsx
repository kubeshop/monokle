import {Collapse as RawCollapse} from 'antd';

import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';

import {useMainPaneDimensions} from '@utils/hooks';

import FilePane from './FilePane';
import HelmPane from './HelmPane';
import ImagesPane from './ImagesPane';
import KustomizePane from './KustomizePane';

const ExplorerPane: React.FC = () => {
  const leftPaneConfiguration = useAppSelector(state => state.ui.paneConfiguration.leftPane);
  const {width} = useMainPaneDimensions();

  return (
    <Collapse accordion ghost defaultActiveKey="files" $width={width * leftPaneConfiguration}>
      <FilePane key="files" />
      <KustomizePane key="kustomize" />
      <HelmPane key="helm" />
      <ImagesPane key="images" />
    </Collapse>
  );
};

export default ExplorerPane;

const Collapse = styled(RawCollapse)<{$width: number}>`
  padding-top: 8px;
  box-sizing: border-box;
  height: 100%;
  padding-bottom: 14px;
  overflow: hidden;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-width: ${({$width}) => $width}px;

  .ant-collapse-header {
    padding-top: 2px !important;
    padding-bottom: 0 !important;
  }
`;
