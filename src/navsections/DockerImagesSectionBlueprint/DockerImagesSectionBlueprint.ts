import {ROOT_FILE_ENTRY} from '@constants/constants';

import {ResourceMapType} from '@models/appstate';
import {DockerImage} from '@models/image';
import {SectionBlueprint} from '@models/navigator';

import {selectDockerImage} from '@redux/reducers/main';

import sectionBlueprintMap from '../sectionBlueprintMap';
import DockerImagesQuickAction from './DockerImagesQuickAction';
import DockerImagesSectionEmptyDisplay from './DockerImagesSectionEmptyDisplay';
import DockerImagesSectionNameDisplay from './DockerImagesSectionNameDisplay';

export type DockerImagesScopeType = {
  resourceMap: ResourceMapType;
  isFolderOpen: boolean;
  isFolderLoading: boolean;
  imagesMap: DockerImage[];
  imagesSearchedValue: string | undefined;
  selectedDockerImage?: DockerImage | null;
  selectedK8sResourceId: string | undefined;
};

export const DOCKER_IMAGES_SECTION_NAME = 'Docker Images' as const;

const filterImagesBySearchedValue = (searchedValue: string, name: string) => {
  let shouldBeFiltered = true;
  const splittedSearchedValue = searchedValue.split(' ');

  for (let i = 0; i < splittedSearchedValue.length; i += 1) {
    if (!name.split(':').find(namePart => namePart.toLowerCase().includes(splittedSearchedValue[i].toLowerCase()))) {
      shouldBeFiltered = false;
      break;
    }
  }

  return shouldBeFiltered;
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
    imagesMap: state.main.imagesMap,
    imagesSearchedValue: state.main.imagesSearchedValue,
    selectedDockerImage: state.main.selectedDockerImage,
    selectedK8sResourceId: state.main.selectedResourceId,
  }),
  builder: {
    getRawItems: scope => scope.imagesMap,
    isLoading: scope => scope.isFolderLoading,
    isInitialized: scope => scope.isFolderOpen,
    isEmpty: (scope, rawItems) => scope.isFolderOpen && rawItems.length === 0,
    isVisible: () => true,
  },
  customization: {
    emptyDisplay: {component: DockerImagesSectionEmptyDisplay},
    nameDisplay: {component: DockerImagesSectionNameDisplay},
    beforeInitializationText: 'Get started by browsing a folder in the File Explorer.',
    counterDisplayMode: 'items',
    disableHoverStyle: true,
  },
  itemBlueprint: {
    getName: rawItem => `${rawItem.name}:${rawItem.tag}`,
    getInstanceId: rawItem => `${rawItem.name}:${rawItem.tag}`,
    builder: {
      isSelected: (rawItem, scope) =>
        scope.selectedDockerImage
          ? rawItem.name === scope.selectedDockerImage.name && rawItem.tag === scope.selectedDockerImage.tag
          : false,
      isHighlighted: (rawItem, scope) => {
        const {resourcesIds} = rawItem;
        const {selectedK8sResourceId} = scope;

        if (selectedK8sResourceId && resourcesIds.includes(selectedK8sResourceId)) {
          return true;
        }

        return false;
      },
      isVisible: (rawItem, scope) => {
        const {imagesSearchedValue} = scope;
        const {name, tag} = rawItem;

        if (imagesSearchedValue) {
          return filterImagesBySearchedValue(imagesSearchedValue, `${name}:${tag}`);
        }

        return true;
      },
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
    customization: {
      quickAction: {
        component: DockerImagesQuickAction,
        options: {isVisibleOnHover: true},
      },
    },
  },
};

sectionBlueprintMap.register(DockerImagesSectionBlueprint);

export default DockerImagesSectionBlueprint;
