import {useMeasure} from 'react-use';

import {Collapse as RawCollapse} from 'antd';

import styled from 'styled-components';

import {isInClusterModeSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setExplorerSelectedSection} from '@redux/reducers/ui';

import {trackEvent} from '@shared/utils/telemetry';

import FilePane from './FilePane';
import HelmPane from './HelmPane';
import ImagesPane from './ImagesPane';
import KustomizePane from './KustomizePane';

const ExplorerPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const explorerSelectedSection = useAppSelector(state => state.ui.explorerSelectedSection);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);

  const [containerRef, {width: containerWidth}] = useMeasure<HTMLDivElement>();

  return (
    <CollapseContainer ref={containerRef}>
      <Collapse
        accordion
        ghost
        activeKey={isInClusterMode ? 'images' : explorerSelectedSection}
        onChange={(key: any) => {
          if (isInClusterMode) {
            return;
          }
          dispatch(setExplorerSelectedSection(key));
          trackEvent('left-menu/activity-changed', {activity: 'explorer', section: key});
        }}
      >
        <FilePane key="files" />
        <KustomizePane key="kustomize" width={containerWidth - 24} />
        <HelmPane key="helm" width={containerWidth - 24} />
        <ImagesPane key="images" width={containerWidth - 24} />
      </Collapse>
    </CollapseContainer>
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

const CollapseContainer = styled.div`
  width: 100%;
  height: 100%;
`;
