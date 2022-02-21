import {HELM_CHART_SECTION_NAME, ROOT_FILE_ENTRY} from '@constants/constants';

import {HelmValuesFile} from '@models/helm';
import {SectionBlueprint} from '@models/navigator';

import {HelmChartEventEmitter} from '@redux/services/helm';

import sectionBlueprintMap from '../sectionBlueprintMap';
import {makeHelmChartSectionBlueprint} from './HelmChartSectionBlueprint';
import RootHelmChartsSectionEmptyDisplay from './RootHelmChartsSectionEmptyDisplay';

export type RootHelmChartsScopeType = {
  isInClusterMode: boolean;
  isFolderOpen: boolean;
  isFolderLoading: boolean;
  isPreviewLoading: boolean;
  isHelmChartPreview: boolean;
  helmChartsLength: number;
};

const RootHelmChartsSectionBlueprint: SectionBlueprint<HelmValuesFile, RootHelmChartsScopeType> = {
  name: HELM_CHART_SECTION_NAME,
  id: HELM_CHART_SECTION_NAME,
  containerElementId: 'helm-sections-container',
  rootSectionId: HELM_CHART_SECTION_NAME,
  childSectionIds: [],
  getScope: state => {
    const kubeConfigPath = state.config.projectConfig?.kubeConfig?.path || state.config.kubeConfig.path;
    return {
      isInClusterMode: kubeConfigPath
        ? Boolean(state.main.previewResourceId && state.main.previewResourceId.endsWith(kubeConfigPath))
        : false,
      isFolderOpen: Boolean(state.main.fileMap[ROOT_FILE_ENTRY]),
      isFolderLoading: state.ui.isFolderLoading,
      isPreviewLoading: state.main.previewLoader.isLoading,
      isHelmChartPreview: state.main.previewType === 'helm',
      helmChartsLength: Object.values(state.main.helmChartMap).length,
    };
  },
  builder: {
    isLoading: scope => {
      if (scope.isPreviewLoading && !scope.isHelmChartPreview) {
        return true;
      }
      return scope.isFolderLoading;
    },
    isInitialized: scope => {
      return scope.isFolderOpen;
    },
    isEmpty: scope => {
      return scope.helmChartsLength === 0;
    },
    shouldBeVisibleBeforeInitialized: true,
  },
  customization: {
    counterDisplayMode: 'subsections',
    emptyDisplay: {
      component: RootHelmChartsSectionEmptyDisplay,
    },
    nameSize: 16,
  },
};

sectionBlueprintMap.register(RootHelmChartsSectionBlueprint);

HelmChartEventEmitter.on('create', helmChart => {
  const {valuesFilesSectionBlueprint, helmChartSectionBlueprint, previewConfigurationsSectionBlueprint} =
    makeHelmChartSectionBlueprint(helmChart);
  if (RootHelmChartsSectionBlueprint.childSectionIds) {
    RootHelmChartsSectionBlueprint.childSectionIds?.push(helmChartSectionBlueprint.id);
  } else {
    RootHelmChartsSectionBlueprint.childSectionIds = [helmChartSectionBlueprint.id];
  }
  sectionBlueprintMap.register(previewConfigurationsSectionBlueprint);
  sectionBlueprintMap.register(valuesFilesSectionBlueprint);
  sectionBlueprintMap.register(helmChartSectionBlueprint);
});

export default RootHelmChartsSectionBlueprint;
