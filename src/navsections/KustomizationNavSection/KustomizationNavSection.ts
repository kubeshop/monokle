import {useSelector} from 'react-redux';
import {PreviewLoaderType, ResourceMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {selectK8sResource} from '@redux/reducers/main';
import {AppDispatch} from '@redux/store';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {NavSection} from '@models/navsection';
import {isInClusterModeSelector} from '@redux/selectors';
import KustomizationQuickAction from './KustomizationQuickAction';

export type KustomizationNavSectionScope = {
  resourceMap: ResourceMapType;
  previewResourceId: string | undefined;
  previewLoader: PreviewLoaderType;
  isInClusterMode: boolean;
  isFolderLoading: boolean;
  dispatch: AppDispatch;
};

const KustomizationNavSection: NavSection<K8sResource, KustomizationNavSectionScope> = {
  name: 'Kustomizations',
  useScope: () => {
    const dispatch = useAppDispatch();
    const resourceMap = useAppSelector(state => state.main.resourceMap);
    const previewResourceId = useAppSelector(state => state.main.previewResourceId);
    const previewLoader = useAppSelector(state => state.main.previewLoader);
    const isFolderLoading = useAppSelector(state => state.ui.isFolderLoading);
    const isInClusterMode = useSelector(isInClusterModeSelector);
    return {
      resourceMap,
      previewResourceId,
      previewLoader,
      isInClusterMode: Boolean(isInClusterMode),
      isFolderLoading,
      dispatch,
    };
  },
  getItems: scope => {
    return Object.values(scope.resourceMap).filter(i => i.kind === 'Kustomization');
  },
  isLoading: scope => {
    return scope.isFolderLoading;
  },
  isVisible: (scope, items) => {
    return !scope.isInClusterMode && !scope.previewLoader.isLoading && items.length > 0;
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
  },
  itemCustomization: {
    QuickAction: KustomizationQuickAction,
  },
};

export default KustomizationNavSection;
