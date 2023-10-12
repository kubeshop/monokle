import {basename} from 'path';

import {ResourceMeta} from '@shared/models/k8sResource';
import {isLocalOrigin} from '@shared/models/origin';

export const renderKustomizeName = (meta: ResourceMeta<'local' | 'cluster' | 'preview' | 'transient'>, name: string) =>
  basename(
    isLocalOrigin(meta.origin) && meta.origin.filePath.lastIndexOf('/') > 1
      ? meta.origin.filePath.substring(0, meta.origin.filePath.lastIndexOf('/'))
      : name
  );
