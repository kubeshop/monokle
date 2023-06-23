import {useMemo} from 'react';

import {forEach} from 'lodash';

import {useAppSelector} from '@redux/hooks';
import {useResourceContentMap, useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';

import {ResourceMeta} from '@shared/models/k8sResource';

import {TableView} from '../TableView';
import {CellAge, CellContextMenu, CellError, CellKind, CellName, CellNamespace} from '../TableView/TableCells';
import NonSelectedImage from './NonSelectedImage';

const ImageResources = () => {
  const selectedImage = useAppSelector(state => state.dashboard.selectedImage);
  const clusterResourceMeta = useResourceMetaMap('cluster');
  const clusterResourceContent = useResourceContentMap('cluster');

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

  return selectedImage ? (
    <TableView
      dataSource={resources}
      columns={[CellKind, CellName, CellError, CellNamespace, CellAge, CellContextMenu]}
    />
  ) : (
    <NonSelectedImage />
  );
};

export default ImageResources;
