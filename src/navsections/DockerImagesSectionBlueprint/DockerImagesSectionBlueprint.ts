import {ROOT_FILE_ENTRY} from '@constants/constants';

import {ResourceMapType} from '@models/appstate';
import {DockerImage} from '@models/image';
import {SectionBlueprint} from '@models/navigator';

import {selectDockerImage} from '@redux/reducers/main';

import sectionBlueprintMap from '../sectionBlueprintMap';
import DockerImagesSectionEmptyDisplay from './DockerImagesSectionEmptyDisplay';

export type DockerImagesScopeType = {
  resourceMap: ResourceMapType;
  isFolderOpen: boolean;
  isFolderLoading: boolean;
  selectedDockerImage: DockerImage | undefined;
};

export const DOCKER_IMAGES_SECTION_NAME = 'Docker Images' as const;

const getRawItems = (resourceMap: ResourceMapType) => {
  let images: DockerImage[] = [];

  Object.values(resourceMap).forEach(k8sResource => {
    if (k8sResource.refs?.length) {
      k8sResource.refs.forEach(ref => {
        if (ref.type === 'outgoing' && ref.target?.type === 'image') {
          const refName = ref.name;
          const refTag = ref.target?.tag || 'latest';

          const foundImage = images.find(image => image.name === refName && image.tag === refTag);

          if (!foundImage) {
            images.push({name: refName, tag: refTag || 'latest', resourcesIds: [k8sResource.id]});
          } else if (!foundImage.resourcesIds.includes(k8sResource.id)) {
            foundImage.resourcesIds.push(k8sResource.id);
          }
        }
      });
    }
  });

  return images;
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
    selectedDockerImage: state.main.selectedDockerImage,
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
    counterDisplayMode: 'items',
    showHeader: false,
  },
  itemBlueprint: {
    getName: rawItem => `${rawItem.name}:${rawItem.tag}`,
    getInstanceId: rawItem => `${rawItem.name}:${rawItem.tag}`,
    builder: {
      isSelected: (rawItem, scope) =>
        scope.selectedDockerImage
          ? rawItem.name === scope.selectedDockerImage.name && rawItem.tag === scope.selectedDockerImage.tag
          : false,
      getMeta: rawItem => ({resourcesIds: rawItem.resourcesIds}),
    },
    instanceHandler: {
      onClick: (itemInstance, dispatch) => {
        const {
          id,
          meta: {resourcesIds},
        } = itemInstance;
        const [name, tag] = id.split(':');

        dispatch(selectDockerImage({name, tag, resourcesIds}));
      },
    },
  },
};

sectionBlueprintMap.register(DockerImagesSectionBlueprint);

export default DockerImagesSectionBlueprint;
