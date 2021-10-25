import {HelmValuesFile} from '@models/helm';
import {HelmChartMapType, HelmValuesMapType} from '@models/appstate';
import {selectHelmValuesFile} from '@redux/reducers/main';
import {NavSection} from '@models/navsection';
import HelmChartQuickAction from './HelmChartQuickAction';

export type HelmChartNavSectionScope = {
  helmChartMap: HelmChartMapType;
  helmValuesMap: HelmValuesMapType;
  previewValuesFileId: string | undefined;
  isInClusterMode: boolean;
  isFolderLoading: boolean;
  isPreviewLoading: boolean;
  isHelmChartPreview: boolean;
};

const HelmChartNavSection: NavSection<HelmValuesFile, HelmChartNavSectionScope> = {
  name: 'Helm Charts',
  id: 'helm_charts',
  getScope: state => {
    return {
      helmChartMap: state.main.helmChartMap,
      helmValuesMap: state.main.helmValuesMap,
      previewValuesFileId: state.main.previewValuesFileId,
      isInClusterMode: Boolean(
        state.main.previewResourceId && state.main.previewResourceId.endsWith(state.config.kubeconfigPath)
      ),
      isFolderLoading: state.ui.isFolderLoading,
      isPreviewLoading: state.main.previewLoader.isLoading,
      isHelmChartPreview: state.main.previewType === 'helm',
    };
  },
  getItems: scope => {
    return Object.values(scope.helmValuesMap);
  },
  getGroups: scope => {
    return Object.values(scope.helmChartMap)
      .map(helmChart => {
        const helmValuesFiles = helmChart.valueFileIds
          .map(valuesFile => scope.helmValuesMap[valuesFile])
          .sort((a, b) => a.name.localeCompare(b.name));
        return {groupId: helmChart.id, groupName: helmChart.name, groupItems: helmValuesFiles};
      })
      .sort((a, b) => a.groupName.localeCompare(b.groupName));
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
    onClick: (item, scope, dispatch) => {
      dispatch(selectHelmValuesFile({valuesFileId: item.id}));
    },
  },
  itemCustomization: {
    QuickAction: HelmChartQuickAction,
  },
};

export default HelmChartNavSection;
