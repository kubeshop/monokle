import {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {HelmValuesFile} from '@models/helm';
import {HelmChartMapType, HelmValuesMapType} from '@models/appstate';
import {selectHelmValuesFile} from '@redux/reducers/main';
import {AppDispatch} from '@redux/store';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {NavSection} from '@models/navsection';
import {isInClusterModeSelector} from '@redux/selectors';
import HelmChartQuickAction from './HelmChartQuickAction';

export type HelmChartNavSectionScope = {
  helmChartMap: HelmChartMapType;
  helmValuesMap: HelmValuesMapType;
  previewValuesFileId: string | undefined;
  isInClusterMode: boolean;
  isFolderLoading: boolean;
  isPreviewLoading: boolean;
  isHelmChartPreview: boolean;
  dispatch: AppDispatch;
};

const HelmChartNavSection: NavSection<HelmValuesFile, HelmChartNavSectionScope> = {
  name: 'Helm Charts',
  useScope: () => {
    const dispatch = useAppDispatch();
    const helmChartMap = useAppSelector(state => state.main.helmChartMap);
    const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
    const previewValuesFileId = useAppSelector(state => state.main.previewValuesFileId);
    const isFolderLoading = useAppSelector(state => state.ui.isFolderLoading);
    const isInClusterMode = useSelector(isInClusterModeSelector);
    const isPreviewLoading = useAppSelector(state => state.main.previewLoader.isLoading);
    const previewType = useAppSelector(state => state.main.previewType);
    const isHelmChartPreview = useMemo(() => previewType === 'helm', [previewType]);
    return {
      helmChartMap,
      helmValuesMap,
      previewValuesFileId,
      isInClusterMode: Boolean(isInClusterMode),
      isFolderLoading,
      isPreviewLoading,
      isHelmChartPreview,
      dispatch,
    };
  },
  getItems: scope => {
    return Object.values(scope.helmValuesMap);
  },
  getItemsGrouped: scope => {
    return Object.fromEntries(
      Object.values(scope.helmChartMap).map(helmChart => {
        const helmValuesFiles = helmChart.valueFileIds.map(valuesFile => scope.helmValuesMap[valuesFile]);
        return [helmChart.name, helmValuesFiles];
      })
    );
  },
  isLoading: scope => {
    if (scope.isPreviewLoading && !scope.isHelmChartPreview) {
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
    isSelected: item => {
      return item.isSelected;
    },
    isDisabled: (item, scope) => Boolean(scope.previewValuesFileId && scope.previewValuesFileId !== item.id),
    onClick: (item, scope) => {
      scope.dispatch(selectHelmValuesFile({valuesFileId: item.id}));
    },
  },
  itemCustomization: {
    QuickAction: HelmChartQuickAction,
  },
};

export default HelmChartNavSection;
