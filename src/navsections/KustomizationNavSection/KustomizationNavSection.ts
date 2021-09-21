import {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {ResourceMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {selectK8sResource} from '@redux/reducers/main';
import {AppDispatch} from '@redux/store';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {NavSection} from '@models/navsection';
import {isInClusterModeSelector} from '@redux/selectors';
import KustomizationQuickAction from './KustomizationQuickAction';
import KustomizationPrefix from './KustomizationPrefix';
import KustomizationSuffix from './KustomizationSuffix';

export type KustomizationNavSectionScope = {
  resourceMap: ResourceMapType;
  previewResourceId: string | undefined;
  isInClusterMode: boolean;
  isFolderLoading: boolean;
  selectedPath: string | undefined;
  selectedResourceId: string | undefined;
  isPreviewLoading: boolean;
  isKustomizationPreview: boolean;
  dispatch: AppDispatch;
};

const KustomizationNavSection: NavSection<K8sResource, KustomizationNavSectionScope> = {
  name: 'Kustomizations',
  useScope: () => {
    const dispatch = useAppDispatch();
    const resourceMap = useAppSelector(state => state.main.resourceMap);
    const previewResourceId = useAppSelector(state => state.main.previewResourceId);
    const isFolderLoading = useAppSelector(state => state.ui.isFolderLoading);
    const isInClusterMode = useSelector(isInClusterModeSelector);
    const selectedPath = useAppSelector(state => state.main.selectedPath);
    const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
    const isPreviewLoading = useAppSelector(state => state.main.previewLoader.isLoading);
    const previewType = useAppSelector(state => state.main.previewType);
    const isKustomizationPreview = useMemo(() => previewType === 'kustomization', [previewType]);
    return {
      resourceMap,
      previewResourceId,
      isInClusterMode: Boolean(isInClusterMode),
      isFolderLoading,
      selectedPath,
      selectedResourceId,
      isPreviewLoading,
      isKustomizationPreview,
      dispatch,
    };
  },
  getItems: scope => {
    return Object.values(scope.resourceMap).filter(i => i.kind === 'Kustomization');
  },
  isLoading: scope => {
    if (scope.isPreviewLoading && !scope.isKustomizationPreview) {
      return true;
    }
    return scope.isFolderLoading;
  },
  isVisible: scope => {
    return !scope.isInClusterMode;
  },
  itemHandler: {
    getName: item => item.name,
    getIdentifier: item => item.id,
    isSelected: (item, scope) => item.isSelected || scope.previewResourceId === item.id,
    isHighlighted: item => item.isHighlighted,
    isDisabled: (item, scope) => Boolean(scope.previewResourceId && scope.previewResourceId !== item.id),
    onClick: (item, scope) => {
      scope.dispatch(selectK8sResource({resourceId: item.id}));
    },
    shouldScrollIntoView: (item, scope) => {
      if (item.isHighlighted && scope.selectedPath) {
        return true;
      }
      if (item.isSelected && scope.selectedResourceId) {
        return true;
      }
      return false;
    },
  },
  itemCustomization: {
    Prefix: KustomizationPrefix,
    Suffix: KustomizationSuffix,
    QuickAction: KustomizationQuickAction,
  },
};

export default KustomizationNavSection;
