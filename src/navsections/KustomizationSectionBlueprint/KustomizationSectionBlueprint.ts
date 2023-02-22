import {isInClusterModeSelector} from '@redux/appConfig';
import {selectResource} from '@redux/reducers/main';
import {getResourceMetaMapFromState} from '@redux/selectors/resourceMapGetters';
import {isKustomizationResource} from '@redux/services/kustomize';
import {isKustomizationPreviewed, isResourceHighlighted, isResourceSelected} from '@redux/services/resource';

import {isResourcePassingFilter} from '@utils/resources';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {ResourceFilterType} from '@shared/models/appState';
import {ResourceMeta, ResourceMetaMap} from '@shared/models/k8sResource';
import {SectionBlueprint} from '@shared/models/navigator';
import {AnyPreview} from '@shared/models/preview';
import {AppSelection} from '@shared/models/selection';

import {KUSTOMIZE_PATCH_SECTION_NAME} from '../KustomizePatchSectionBlueprint';
import sectionBlueprintMap from '../sectionBlueprintMap';
import KustomizationContextMenu from './KustomizationContextMenu';
import KustomizationPrefix from './KustomizationPrefix';
import KustomizationQuickAction from './KustomizationQuickAction';
import KustomizationSectionEmptyDisplay from './KustomizationSectionEmptyDisplay';
import KustomizationSuffix from './KustomizationSuffix';

export type KustomizationScopeType = {
  localResourceMetaMap: ResourceMetaMap<'local'>;
  resourceFilters: ResourceFilterType;
  isInClusterMode: boolean;
  isFolderOpen: boolean;
  isFolderLoading: boolean;
  selection: AppSelection | undefined;
  highlights: AppSelection[] | undefined;
  preview: AnyPreview | undefined;
  isPreviewLoading: boolean;
  isKustomizationPreview: boolean;
};

export const KUSTOMIZATION_SECTION_NAME = 'Kustomizations' as const;

const KustomizationSectionBlueprint: SectionBlueprint<ResourceMeta<'local'>, KustomizationScopeType> = {
  name: KUSTOMIZATION_SECTION_NAME,
  id: KUSTOMIZATION_SECTION_NAME,
  rootSectionId: KUSTOMIZE_PATCH_SECTION_NAME,
  containerElementId: 'kustomize-sections-container',
  getScope: state => {
    return {
      localResourceMetaMap: getResourceMetaMapFromState(state, 'local'),
      resourceFilters: state.main.resourceFilter,
      isInClusterMode: isInClusterModeSelector(state),
      isFolderOpen: Boolean(state.main.fileMap[ROOT_FILE_ENTRY]),
      isFolderLoading: state.ui.isFolderLoading,
      selection: state.main.selection,
      highlights: state.main.highlights,
      preview: state.main.preview,
      isPreviewLoading: Boolean(state.main.previewOptions.isLoading),
      isKustomizationPreview: state.main.preview?.type === 'kustomize',
    };
  },
  builder: {
    getRawItems: scope => {
      return Object.values(scope.localResourceMetaMap)
        .filter(i => isKustomizationResource(i))
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    isLoading: scope => {
      if (scope.isPreviewLoading && !scope.isKustomizationPreview) {
        return true;
      }
      return scope.isFolderLoading;
    },
    isInitialized: scope => {
      return scope.isFolderOpen;
    },
    isEmpty: (scope, rawItems) => {
      return scope.isFolderOpen && rawItems.length === 0;
    },
    shouldBeVisibleBeforeInitialized: true,
  },
  customization: {
    emptyDisplay: {
      component: KustomizationSectionEmptyDisplay,
    },
    beforeInitializationText: 'Get started by browsing a folder in the File Explorer.',
    counterDisplayMode: 'items',
  },
  itemBlueprint: {
    getName: rawItem => rawItem.name,
    getInstanceId: rawItem => rawItem.id,
    builder: {
      isSelected: (rawItem, scope) =>
        isResourceSelected(rawItem, scope.selection) || isKustomizationPreviewed(rawItem, scope.preview),
      isHighlighted: (rawItem, scope) => isResourceHighlighted(rawItem, scope.highlights),
      isDisabled: (rawItem, scope) =>
        Boolean(
          (scope.preview?.type === 'kustomize' && scope.preview.kustomizationId !== rawItem.id) ||
            scope.isInClusterMode ||
            !isResourcePassingFilter(rawItem, scope.resourceFilters)
        ),
      getMeta: rawItem => {
        return {
          resourceStorage: rawItem.storage,
        };
      },
    },
    instanceHandler: {
      onClick: (itemInstance, dispatch) => {
        dispatch(
          selectResource({resourceIdentifier: {id: itemInstance.id, storage: itemInstance.meta.resourceStorage}})
        );
      },
    },
    customization: {
      prefix: {component: KustomizationPrefix},
      suffix: {component: KustomizationSuffix},
      contextMenu: {component: KustomizationContextMenu, options: {isVisibleOnHover: true}},
      quickAction: {component: KustomizationQuickAction, options: {isVisibleOnHover: true}},
    },
  },
};

sectionBlueprintMap.register(KustomizationSectionBlueprint);

export default KustomizationSectionBlueprint;
