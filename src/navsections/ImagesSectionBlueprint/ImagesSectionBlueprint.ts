import {ROOT_FILE_ENTRY} from '@constants/constants';

import {ImagesListType, ResourceMapType} from '@models/appstate';
import {ImageType} from '@models/image';
import {SectionBlueprint} from '@models/navigator';

import {selectImage} from '@redux/reducers/main';

import sectionBlueprintMap from '../sectionBlueprintMap';
import ImagesQuickAction from './ImagesQuickAction';
import ImagesSectionEmptyDisplay from './ImagesSectionEmptyDisplay';
import ImagesSectionNameDisplay from './ImagesSectionNameDisplay';

export type ImagesScopeType = {
  resourceMap: ResourceMapType;
  isFolderOpen: boolean;
  isFolderLoading: boolean;
  imagesList: ImagesListType;
  imagesSearchedValue: string | undefined;
  selectedImage?: ImageType | null;
  selectedK8sResourceId: string | undefined;
};

export const IMAGES_SECTION_NAME = 'Images' as const;

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

const ImagesSectionBlueprint: SectionBlueprint<ImageType, ImagesScopeType> = {
  name: 'Images',
  id: IMAGES_SECTION_NAME,
  containerElementId: 'images-section-container',
  rootSectionId: IMAGES_SECTION_NAME,
  getScope: state => ({
    resourceMap: state.main.resourceMap,
    isFolderOpen: Boolean(state.main.fileMap[ROOT_FILE_ENTRY]),
    isFolderLoading: state.ui.isFolderLoading,
    imagesList: state.main.imagesList,
    imagesSearchedValue: state.main.imagesSearchedValue,
    selectedImage: state.main.selectedImage,
    selectedK8sResourceId: state.main.selectedResourceId,
  }),
  builder: {
    getRawItems: scope => scope.imagesList,
    isLoading: scope => scope.isFolderLoading,
    isInitialized: scope => scope.isFolderOpen,
    isEmpty: (scope, rawItems) => scope.isFolderOpen && rawItems.length === 0,
    isVisible: () => true,
  },
  customization: {
    emptyDisplay: {component: ImagesSectionEmptyDisplay},
    nameDisplay: {component: ImagesSectionNameDisplay},
    beforeInitializationText: 'Get started by browsing a folder in the File Explorer.',
    counterDisplayMode: 'items',
    disableHoverStyle: true,
  },
  itemBlueprint: {
    getName: rawItem => `${rawItem.name}:${rawItem.tag}`,
    getInstanceId: rawItem => `${rawItem.name}:${rawItem.tag}`,
    builder: {
      isSelected: (rawItem, scope) =>
        scope.selectedImage
          ? rawItem.name === scope.selectedImage.name && rawItem.tag === scope.selectedImage.tag
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

        dispatch(selectImage({image: {id, name, tag, resourcesIds}}));
      },
    },
    customization: {
      quickAction: {
        component: ImagesQuickAction,
        options: {isVisibleOnHover: true},
      },
    },
  },
};

sectionBlueprintMap.register(ImagesSectionBlueprint);

export default ImagesSectionBlueprint;
