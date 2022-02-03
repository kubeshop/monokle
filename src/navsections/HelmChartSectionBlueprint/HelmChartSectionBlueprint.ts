import {ROOT_FILE_ENTRY} from '@constants/constants';

import {HelmChartMapType, HelmValuesMapType} from '@models/appstate';
import {HelmValuesFile} from '@models/helm';
import {SectionBlueprint} from '@models/navigator';

import {selectHelmValuesFile} from '@redux/reducers/main';

import sectionBlueprintMap from '../sectionBlueprintMap';
import HelmChartQuickAction from './HelmChartQuickAction';
import HelmChartSectionEmptyDisplay from './HelmChartSectionEmptyDisplay';

export type HelmChartScopeType = {
  helmChartMap: HelmChartMapType;
  helmValuesMap: HelmValuesMapType;
  previewValuesFileId: string | undefined;
  isInClusterMode: boolean;
  isFolderOpen: boolean;
  isFolderLoading: boolean;
  isPreviewLoading: boolean;
  isHelmChartPreview: boolean;
};

export const HELM_CHART_SECTION_NAME = 'Helm Charts' as const;

const HelmChartSectionBlueprint: SectionBlueprint<HelmValuesFile, HelmChartScopeType> = {
  name: HELM_CHART_SECTION_NAME,
  id: HELM_CHART_SECTION_NAME,
  containerElementId: 'helm-sections-container',
  rootSectionId: HELM_CHART_SECTION_NAME,
  getScope: state => {
    const kubeConfigPath = state.config.projectConfig?.kubeConfig?.path || state.config.kubeConfig.path;
    return {
      helmChartMap: state.main.helmChartMap,
      helmValuesMap: state.main.helmValuesMap,
      previewValuesFileId: state.main.previewValuesFileId,
      isInClusterMode: kubeConfigPath
        ? Boolean(state.main.previewResourceId && state.main.previewResourceId.endsWith(kubeConfigPath))
        : false,
      isFolderOpen: Boolean(state.main.fileMap[ROOT_FILE_ENTRY]),
      isFolderLoading: state.ui.isFolderLoading,
      isPreviewLoading: state.main.previewLoader.isLoading,
      isHelmChartPreview: state.main.previewType === 'helm',
    };
  },
  builder: {
    getRawItems: scope => {
      return Object.values(scope.helmValuesMap);
    },
    getGroups: scope => {
      return Object.values(scope.helmChartMap)
        .map(helmChart => {
          const helmValuesFiles = helmChart.valueFileIds
            .map(valuesFile => scope.helmValuesMap[valuesFile])
            .sort((a, b) => a.name.localeCompare(b.name));
          return {id: helmChart.id, name: helmChart.name, itemIds: helmValuesFiles.map(vf => vf.id)};
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    isLoading: scope => {
      if (scope.isPreviewLoading && !scope.isHelmChartPreview) {
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
    emptyDisplay: {component: HelmChartSectionEmptyDisplay},
    emptyGroupText: 'No values files found for this Chart.',
    beforeInitializationText: 'Get started by browsing a folder in the File Explorer.',
  },
  itemBlueprint: {
    getName: rawItem => rawItem.name,
    getInstanceId: rawItem => rawItem.id,
    builder: {
      isSelected: rawItem => {
        return rawItem.isSelected;
      },
      isDisabled: (rawItem, scope) =>
        Boolean((scope.previewValuesFileId && scope.previewValuesFileId !== rawItem.id) || scope.isInClusterMode),
    },
    instanceHandler: {
      onClick: (itemInstance, dispatch) => {
        dispatch(selectHelmValuesFile({valuesFileId: itemInstance.id}));
      },
    },
    customization: {
      quickAction: {
        component: HelmChartQuickAction,
        options: {isVisibleOnHover: true},
      },
    },
  },
};

sectionBlueprintMap.register(HelmChartSectionBlueprint);

export default HelmChartSectionBlueprint;
