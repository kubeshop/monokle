import {useMemo} from 'react';

import {forEach} from 'lodash';

import {useAppSelector} from '@redux/hooks';
import {useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';

import {ResourceMeta} from '@shared/models/k8sResource';

import {TableView} from '../TableView';
import {CellContextMenu, CellError, CellName, CellNamespace} from '../TableView/TableCells';
import NonSelectedImage from './NonSelectedImage';

const ImageResources = () => {
  const selectedImage = useAppSelector(state => state.dashboard.selectedImage);
  const clusterResourceMeta = useResourceMetaMap('cluster');

  const resources = useMemo(() => {
    if (!selectedImage) {
      return [];
    }

    const data: Array<ResourceMeta> = [];

    forEach(clusterResourceMeta, (resource: ResourceMeta) => {
      if (selectedImage.resourcesIds.includes(resource.id)) {
        data.push(resource);
      }
    });

    return data;
  }, [selectedImage, clusterResourceMeta]);

  return selectedImage ? (
    <TableView dataSource={resources} columns={[CellName, CellError, CellNamespace, CellContextMenu]} />
  ) : (
    <NonSelectedImage />
  );
};

export default ImageResources;
