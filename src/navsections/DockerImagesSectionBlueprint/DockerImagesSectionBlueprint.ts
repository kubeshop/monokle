import _ from 'lodash';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {ResourceMapType} from '@models/appstate';
import {DockerImage} from '@models/image';
import {SectionBlueprint} from '@models/navigator';

import sectionBlueprintMap from '../sectionBlueprintMap';
import DockerImagesSectionEmptyDisplay from './DockerImagesSectionEmptyDisplay';

export type DockerImagesScopeType = {
  resourceMap: ResourceMapType;
  // previewResourceId: string | undefined;
  // isInClusterMode: boolean;
  isFolderOpen: boolean;
  isFolderLoading: boolean;
  // selectedPath: string | undefined;
  // selectedResourceId: string | undefined;
  // isPreviewLoading: boolean;
  // isKustomizationPreview: boolean;
};

export const DOCKER_IMAGES_SECTION_NAME = 'Docker Images' as const;

const getRawItems = (resourceMap: ResourceMapType) => {
  let images: DockerImage[] = [];

  Object.values(resourceMap).forEach(k8sResource => {
    if (k8sResource.refs?.length) {
      k8sResource.refs.forEach(ref => {
        if (ref.type === 'outgoing' && ref.target?.type === 'image') {
          images.push({name: ref.name, tag: ref.target?.tag || 'latest'});
        }
      });
    }
  });

  return _.uniqWith(images, _.isEqual);
};

const DockerImagesSectionBlueprint: SectionBlueprint<DockerImage, DockerImagesScopeType> = {
  name: 'Docker Images',
  id: DOCKER_IMAGES_SECTION_NAME,
  containerElementId: 'docker-images-section-container',
  rootSectionId: DOCKER_IMAGES_SECTION_NAME,
  getScope: state => ({
    resourceMap: state.main.resourceMap,
    isFolderOpen: Boolean(state.main.fileMap[ROOT_FILE_ENTRY]),
    isFolderLoading: state.ui.isFolderLoading,
  }),
  builder: {
    getRawItems: scope => getRawItems(scope.resourceMap),
    isLoading: scope => scope.isFolderLoading,
    isInitialized: scope => scope.isFolderOpen,
    isEmpty: (scope, rawItems) => scope.isFolderOpen && rawItems.length === 0,
  },
  customization: {
    emptyDisplay: {component: DockerImagesSectionEmptyDisplay},
    beforeInitializationText: 'Get started by browsing a folder in the File Explorer.',
    counterDisplayMode: 'none',
    showHeader: false,
  },
  itemBlueprint: {
    getName: rawItem => `${rawItem.name}:${rawItem.tag}`,
    getInstanceId: rawItem => `${rawItem.name}:${rawItem.tag}`,
  },
};

sectionBlueprintMap.register(DockerImagesSectionBlueprint);

export default DockerImagesSectionBlueprint;
