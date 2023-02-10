import {selectResource} from '@redux/reducers/main';
import {isInClusterModeSelector} from '@redux/selectors';
import {getResourceMetaMapFromState} from '@redux/selectors/resourceMapGetters';
import {isResourceHighlighted, isResourceSelected} from '@redux/services/resource';

import {ResourceFilterType} from '@shared/models/appState';
import {ResourceMeta, ResourceMetaMap} from '@shared/models/k8sResource';
import {SectionBlueprint} from '@shared/models/navigator';
import {AppSelection} from '@shared/models/selection';

import sectionBlueprintMap from '../sectionBlueprintMap';
import KustomizePatchPrefix from './KustomizePatchPrefix';
import KustomizePatchSuffix from './KustomizePatchSuffix';

export type KustomizePatchScopeType = {
  localResourceMetaMap: ResourceMetaMap<'local'>;
  resourceFilter: ResourceFilterType;
  selection: AppSelection | undefined;
  highlights: AppSelection[] | undefined;
  isInClusterMode: boolean;
  isPreviewLoading: boolean;
  isFolderLoading: boolean;
};

export const KUSTOMIZE_PATCH_SECTION_NAME = 'Patch Resources' as const;

const KustomizePatchSectionBlueprint: SectionBlueprint<ResourceMeta<'local'>, KustomizePatchScopeType> = {
  name: KUSTOMIZE_PATCH_SECTION_NAME,
  id: KUSTOMIZE_PATCH_SECTION_NAME,
  rootSectionId: KUSTOMIZE_PATCH_SECTION_NAME,
  containerElementId: 'kustomize-sections-container',
  getScope: state => {
    return {
      localResourceMetaMap: getResourceMetaMapFromState(state, 'local'),
      resourceFilter: state.main.resourceFilter,
      selection: state.main.selection,
      highlights: state.main.highlights,
      isInClusterMode: isInClusterModeSelector(state),
      isPreviewLoading: Boolean(state.main.previewOptions.isLoading),
      isFolderLoading: state.ui.isFolderLoading,
    };
  },
  builder: {
    getRawItems: scope => {
      return Object.values(scope.localResourceMetaMap).filter(resource => resource.name.startsWith('Patch:'));
    },
    getGroups: scope => {
      const patchResources = Object.values(scope.localResourceMetaMap).filter(resource =>
        resource.name.startsWith('Patch:')
      );
      const patchResourcesByKind: Record<string, ResourceMeta[]> = patchResources.reduce<
        Record<string, ResourceMeta[]>
      >((acc, resource) => {
        if (acc[resource.kind]) {
          acc[resource.kind].push(resource);
        } else {
          acc[resource.kind] = [resource];
        }
        return acc;
      }, {});
      return Object.entries(patchResourcesByKind)
        .map(([resourceKind, resources]) => {
          return {
            id: resourceKind,
            name: resourceKind,
            itemIds: resources.map(r => r.id),
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    isVisible: (_, rawItems) => {
      return rawItems.length > 0;
    },
    isLoading: scope => {
      return scope.isFolderLoading;
    },
    isInitialized: (_, rawItems) => {
      return rawItems.length > 0;
    },
  },
  itemBlueprint: {
    getName: rawItem => rawItem.name,
    getInstanceId: rawItem => rawItem.id,
    builder: {
      isSelected: (rawItem, scope) => isResourceSelected(rawItem, scope.selection),
      isHighlighted: (rawItem, scope) => isResourceHighlighted(rawItem, scope.highlights),
      isDisabled: (_, scope) => Boolean(scope.isInClusterMode),
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
      prefix: {
        component: KustomizePatchPrefix,
      },
      suffix: {
        component: KustomizePatchSuffix,
      },
    },
  },
};

sectionBlueprintMap.register(KustomizePatchSectionBlueprint);

export default KustomizePatchSectionBlueprint;
