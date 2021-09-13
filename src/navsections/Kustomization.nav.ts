import {ResourceMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {selectK8sResource} from '@redux/reducers/main';
import {AppDispatch} from '@redux/store';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {NavSection} from '@models/navsection';

export type KustomizationNavSectionScope = {resourceMap: ResourceMapType; dispatch: AppDispatch};

export const KustomizationNavSection: NavSection<K8sResource, KustomizationNavSectionScope> = {
  name: 'Kustomizations',
  useScope: () => {
    const dispatch = useAppDispatch();
    const resourceMap = useAppSelector(state => state.main.resourceMap);
    return {resourceMap, dispatch};
  },
  getItems: scope => {
    return Object.values(scope.resourceMap).filter(i => i.kind === 'Kustomization');
  },
  itemHandler: {
    getName: item => item.name,
    getIdentifier: item => item.id,
    isSelected: item => item.isSelected,
    isHighlighted: item => item.isHighlighted,
    onClick: (item, scope) => {
      scope.dispatch(selectK8sResource({resourceId: item.id}));
    },
  },
};
