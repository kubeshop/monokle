import {HELM_CHART_SECTION_NAME, ROOT_FILE_ENTRY} from '@constants/constants';

import {HelmValuesMapType} from '@models/appstate';
import {HelmChart, HelmValuesFile} from '@models/helm';
import {SectionBlueprint} from '@models/navigator';

import {selectHelmValuesFile} from '@redux/reducers/main';

import sectionBlueprintMap from '../sectionBlueprintMap';
import HelmChartQuickAction from './HelmChartQuickAction';

export type ValuesFilesScopeType = {
  helmValuesMap: HelmValuesMapType;
  previewValuesFileId: string | undefined;
  isInClusterMode: boolean;
  isFolderOpen: boolean;
};

export function makeHelmChartSectionBlueprint(helmChart: HelmChart) {
  const valuesFilesSectionBlueprint: SectionBlueprint<HelmValuesFile, ValuesFilesScopeType> = {
    name: 'Values Files',
    id: `${helmChart.id}-values`,
    containerElementId: 'helm-section-container',
    rootSectionId: HELM_CHART_SECTION_NAME,
    getScope: state => {
      const kubeConfigPath = state.config.projectConfig?.kubeConfig?.path || state.config.kubeConfig.path;
      return {
        helmValuesMap: state.main.helmValuesMap,
        isInClusterMode: kubeConfigPath
          ? Boolean(state.main.previewResourceId && state.main.previewResourceId.endsWith(kubeConfigPath))
          : false,
        previewValuesFileId: state.main.previewValuesFileId,
        isFolderOpen: Boolean(state.main.fileMap[ROOT_FILE_ENTRY]),
      };
    },
    builder: {
      getRawItems: scope => {
        return helmChart.valueFileIds
          .map(id => scope.helmValuesMap[id])
          .filter((v): v is HelmValuesFile => v !== undefined);
      },
      isInitialized: scope => {
        return scope.isFolderOpen;
      },
      isEmpty: (scope, rawItems) => {
        return scope.isFolderOpen && rawItems.length === 0;
      },
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

  const helmChartSectionBlueprint: SectionBlueprint<any, any> = {
    name: helmChart.name,
    id: helmChart.id,
    containerElementId: 'helm-sections-container',
    rootSectionId: HELM_CHART_SECTION_NAME,
    childSectionIds: [valuesFilesSectionBlueprint.id],
    getScope: () => {
      return {};
    },
  };

  sectionBlueprintMap.register(valuesFilesSectionBlueprint);
  sectionBlueprintMap.register(helmChartSectionBlueprint);

  return helmChartSectionBlueprint;
}
