import {useCallback, useMemo} from 'react';

import {forEach} from 'lodash';
import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';
import {useResourceContentMap, useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';

import {useMainPaneDimensions} from '@utils/hooks';

import {ResourceMeta} from '@shared/models/k8sResource';
import {trackEvent} from '@shared/utils';

import {Header} from '../Header/Header';
import {TableView} from '../TableView';
import {CellAge, CellContextMenu, CellError, CellKind, CellName, CellNamespace} from '../TableView/TableCells';
import NonSelectedImage from './NonSelectedImage';

const ImageResources = () => {
  const {height} = useMainPaneDimensions();

  const selectedImage = useAppSelector(state => state.dashboard.selectedImage);
  const clusterResourceMeta = useResourceMetaMap('cluster');
  const clusterResourceContent = useResourceContentMap('cluster');
  const terminalHeight = useAppSelector(state => state.ui.paneConfiguration.bottomPaneHeight);
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);

  const resources = useMemo(() => {
    if (!selectedImage) {
      return [];
    }

    const data: Array<ResourceMeta> = [];

    forEach(clusterResourceMeta, (resource: ResourceMeta) => {
      if (selectedImage.resourcesIds.includes(resource.id)) {
        data.push({...resource, ...clusterResourceContent[resource.id]});
      }
    });

    return data;
  }, [selectedImage, clusterResourceMeta, clusterResourceContent]);

  const onRowClickHandler = useCallback((resource: ResourceMeta) => {
    trackEvent('image_resources/select_resource', {kind: resource.kind});
  }, []);

  return selectedImage ? (
    <Container>
      <Header title={selectedImage.id} />
      <TableView
        dataSource={resources}
        columns={[CellKind, CellName, CellError, CellNamespace, CellAge, CellContextMenu]}
        onRowClick={onRowClickHandler}
        tableScrollHeight={height - 300 - (bottomSelection === 'terminal' ? terminalHeight : 0)}
      />
    </Container>
  ) : (
    <NonSelectedImage />
  );
};

export default ImageResources;

const Container = styled.div`
  height: calc(100vh - 110px);
`;
