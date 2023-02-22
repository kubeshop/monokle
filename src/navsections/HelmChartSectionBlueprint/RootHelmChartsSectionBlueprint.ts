import {HELM_CHART_SECTION_NAME} from '@constants/constants';

import {isInClusterModeSelector} from '@redux/appConfig';
import {HelmChartEventEmitter} from '@redux/services/helm';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {HelmValuesFile} from '@shared/models/helm';
import {SectionBlueprint} from '@shared/models/navigator';

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
    return {
      isInClusterMode: isInClusterModeSelector(state),
      isFolderOpen: Boolean(state.main.fileMap[ROOT_FILE_ENTRY]),
      isFolderLoading: state.ui.isFolderLoading,
      isPreviewLoading: Boolean(state.main.previewOptions.isLoading),
      isHelmChartPreview: state.main.preview?.type === 'helm',
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
  const {
    valuesFilesSectionBlueprint,
    helmChartSectionBlueprint,
    previewConfigurationsSectionBlueprint,
    templateFilesSectionBlueprint,
  } = makeHelmChartSectionBlueprint(helmChart);
  if (RootHelmChartsSectionBlueprint.childSectionIds) {
    RootHelmChartsSectionBlueprint.childSectionIds?.push(helmChartSectionBlueprint.id);
  } else {
    RootHelmChartsSectionBlueprint.childSectionIds = [helmChartSectionBlueprint.id];
  }
  sectionBlueprintMap.register(templateFilesSectionBlueprint);
  sectionBlueprintMap.register(previewConfigurationsSectionBlueprint);
  sectionBlueprintMap.register(valuesFilesSectionBlueprint);
  sectionBlueprintMap.register(helmChartSectionBlueprint);
});

HelmChartEventEmitter.on('remove', helmChartId => {
  sectionBlueprintMap.remove(`${helmChartId}-templates`, [RootHelmChartsSectionBlueprint.id, helmChartId]);
  sectionBlueprintMap.remove(`${helmChartId}-configurations`, [RootHelmChartsSectionBlueprint.id, helmChartId]);
  sectionBlueprintMap.remove(`${helmChartId}-values`, [RootHelmChartsSectionBlueprint.id, helmChartId]);
  sectionBlueprintMap.remove(helmChartId, [RootHelmChartsSectionBlueprint.id]);
});

export default RootHelmChartsSectionBlueprint;
