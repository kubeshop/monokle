import {HELM_CHART_SECTION_NAME, ROOT_FILE_ENTRY} from '@constants/constants';

import {HelmValuesFile} from '@models/helm';
import {SectionBlueprint} from '@models/navigator';

import {HelmChartEventEmitter} from '@redux/services/helm';

import sectionBlueprintMap from '../sectionBlueprintMap';
import {makeHelmChartSectionBlueprint} from './HelmChartSectionBlueprint';

export type RootHelmChartsScopeType = {
  isInClusterMode: boolean;
  isFolderOpen: boolean;
  isFolderLoading: boolean;
  isPreviewLoading: boolean;
  isHelmChartPreview: boolean;
};

const HelmChartSectionBlueprint: SectionBlueprint<HelmValuesFile, RootHelmChartsScopeType> = {
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
    shouldBeVisibleBeforeInitialized: true,
  },
};

sectionBlueprintMap.register(HelmChartSectionBlueprint);

HelmChartEventEmitter.on('create', helmChart => {
  const newHelmChartSectionBlueprint = makeHelmChartSectionBlueprint(helmChart);
  if (HelmChartSectionBlueprint.childSectionIds) {
    HelmChartSectionBlueprint.childSectionIds?.push(newHelmChartSectionBlueprint.id);
  } else {
    HelmChartSectionBlueprint.childSectionIds = [newHelmChartSectionBlueprint.id];
  }
});

export default HelmChartSectionBlueprint;
