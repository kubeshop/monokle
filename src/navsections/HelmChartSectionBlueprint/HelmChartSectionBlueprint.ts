import {HELM_CHART_SECTION_NAME} from '@constants/constants';

import {selectFile, selectHelmValuesFile, selectPreviewConfiguration} from '@redux/reducers/main';
import {isInClusterModeSelector} from '@redux/selectors';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {FileMapType, HelmTemplatesMapType, HelmValuesMapType} from '@shared/models/appState';
import {HelmPreviewConfiguration} from '@shared/models/config';
import {HelmChart, HelmTemplate, HelmValuesFile} from '@shared/models/helm';
import {SectionBlueprint} from '@shared/models/navigator';
import {Colors} from '@shared/styles/colors';
import {isDefined} from '@shared/utils/filter';

import CollapseSectionPrefix from './CollapseSectionPrefix';
import HelmChartContextMenu from './HelmChartContextMenu';
import HelmChartContextMenuWrapper from './HelmChartContextMenuWrapper';
import HelmChartQuickAction from './HelmChartQuickAction';
import ItemPrefix from './ItemPrefix';
import PreviewConfigurationNameSuffix from './PreviewConfigurationNameSuffix';
import PreviewConfigurationQuickAction from './PreviewConfigurationQuickAction';

type TemplatesScopeType = {
  fileMap: FileMapType;
  fileOrFolderContainedIn: string;
  helmTemplatesMap: HelmTemplatesMapType;
  isFolderOpen: boolean;
  selectedFile: string | undefined;
  [currentHelmChart: string]: HelmChart | unknown;
};

export type ValuesFilesScopeType = {
  helmValuesMap: HelmValuesMapType;
  previewValuesFileId: string | undefined;
  fileOrFolderContainedIn: string;
  isInClusterMode: boolean;
  isFolderOpen: boolean;
  selectedHelmValuesId: string | undefined;
  [currentHelmChart: string]: HelmChart | unknown;
};

type HelmChartScopeType = {
  fileOrFolderContainedIn: string;
  selectedFile: string | undefined;
  previewValuesFileId: string | undefined;
  isInClusterMode: boolean;
  [currentHelmChart: string]: HelmChart | unknown;
};

type PreviewConfigurationScopeType = {
  previewConfigurationMap: Record<string, HelmPreviewConfiguration | null> | undefined;
  selectedPreviewConfigurationId: string | undefined;
  [currentHelmChart: string]: HelmChart | unknown;
};

export function makeHelmChartSectionBlueprint(helmChart: HelmChart) {
  const previewConfigurationsSectionBlueprint: SectionBlueprint<
    HelmPreviewConfiguration,
    PreviewConfigurationScopeType
  > = {
    name: 'Preview Configurations',
    id: `${helmChart.id}-configurations`,
    containerElementId: 'helm-section-container',
    rootSectionId: HELM_CHART_SECTION_NAME,
    getScope: state => {
      return {
        previewConfigurationMap: state.config.projectConfig?.helm?.previewConfigurationMap,
        selectedPreviewConfigurationId:
          state.main.selection?.type === 'preview.configuration'
            ? state.main.selection.previewConfigurationId
            : undefined,
        [helmChart.id]: state.main.helmChartMap[helmChart.id],
      };
    },
    builder: {
      getRawItems: scope => {
        const currentHelmChart = scope[helmChart.id] as HelmChart | undefined;
        if (!currentHelmChart) {
          return [];
        }
        return scope.previewConfigurationMap
          ? Object.values(scope.previewConfigurationMap).filter((pc): pc is HelmPreviewConfiguration =>
              Boolean(pc && pc.helmChartFilePath === currentHelmChart.filePath)
            )
          : [];
      },
      isInitialized: () => true,
      isVisible: () => true,
    },
    itemBlueprint: {
      getInstanceId: rawItem => rawItem.id,
      getName: rawItem => rawItem.name,
      builder: {
        getMeta: () => {
          return {
            itemPrefixStyle: {
              paddingLeft: 10,
            },
            itemPrefixIcon: 'preview',
          };
        },

        isSelected: (item, scope) => {
          return item.id === scope.selectedPreviewConfigurationId;
        },
      },
      instanceHandler: {
        onClick: (itemInstance, dispatch) => {
          dispatch(selectPreviewConfiguration({previewConfigurationId: itemInstance.id}));
        },
      },
      customization: {
        quickAction: {
          component: PreviewConfigurationQuickAction,
          options: {isVisibleOnHover: true},
        },
        prefix: {
          component: ItemPrefix,
        },
        lastItemMarginBottom: 0,
      },
    },
    customization: {
      counterDisplayMode: 'items',
      indentation: 10,
      nameWeight: 400,
      nameSize: 14,
      nameColor: Colors.grey9,
      nameHorizontalPadding: 0,
      namePrefix: {
        component: CollapseSectionPrefix,
      },
      nameSuffix: {
        component: PreviewConfigurationNameSuffix,
        options: {
          isVisibleOnHover: true,
        },
      },
    },
  };

  const templateFilesSectionBlueprint: SectionBlueprint<HelmTemplate, TemplatesScopeType> = {
    name: 'Templates',
    id: `${helmChart.id}-templates`,
    containerElementId: 'helm-section-container',
    rootSectionId: HELM_CHART_SECTION_NAME,
    getScope: state => {
      return {
        fileMap: state.main.fileMap,
        fileOrFolderContainedIn: state.main.resourceFilter.fileOrFolderContainedIn || '',
        helmTemplatesMap: state.main.helmTemplatesMap,
        isFolderOpen: Boolean(state.main.fileMap[ROOT_FILE_ENTRY]),
        selectedFile: state.main.selection?.type === 'file' ? state.main.selection.filePath : undefined,
        [helmChart.id]: state.main.helmChartMap[helmChart.id],
      };
    },
    builder: {
      getRawItems: scope => {
        const currentHelmChart = scope[helmChart.id] as HelmChart | undefined;
        if (!currentHelmChart) {
          return [];
        }
        return currentHelmChart.templateIds.map(id => scope.helmTemplatesMap[id]).filter(isDefined);
      },
      isInitialized: scope => {
        return scope.isFolderOpen;
      },
      isEmpty: (scope, rawItems) => {
        return scope.isFolderOpen && rawItems.length === 0;
      },
    },
    customization: {
      counterDisplayMode: 'items',
      indentation: 10,
      nameWeight: 400,
      nameSize: 14,
      nameColor: Colors.grey9,
      nameHorizontalPadding: 0,
      namePrefix: {
        component: CollapseSectionPrefix,
      },
    },
    itemBlueprint: {
      getName: rawItem => rawItem.name,
      getInstanceId: rawItem => rawItem.id,
      builder: {
        isDisabled: (rawItem, scope) => !rawItem.filePath.startsWith(scope.fileOrFolderContainedIn),
        isSelected: (rawItem, scope) => {
          return rawItem.filePath === scope.selectedFile;
        },
        getMeta: template => {
          return {
            filePath: template.filePath,
            itemPrefixStyle: {
              paddingLeft: 10,
            },
            itemPrefixIcon: 'helm',
          };
        },
      },
      instanceHandler: {
        onClick: (itemInstance, dispatch) => {
          const filePath: string | undefined = itemInstance.meta?.filePath;

          if (!filePath) {
            return;
          }

          dispatch(selectFile({filePath}));
        },
      },
      customization: {
        contextMenu: {component: HelmChartContextMenu, options: {isVisibleOnHover: true}},
        contextMenuWrapper: {component: HelmChartContextMenuWrapper, options: {isVisibleOnHover: false}},
        prefix: {
          component: ItemPrefix,
        },
        lastItemMarginBottom: 0,
      },
    },
  };

  const valuesFilesSectionBlueprint: SectionBlueprint<HelmValuesFile, ValuesFilesScopeType> = {
    name: 'Values Files',
    id: `${helmChart.id}-values`,
    containerElementId: 'helm-section-container',
    rootSectionId: HELM_CHART_SECTION_NAME,
    getScope: state => {
      return {
        helmValuesMap: state.main.helmValuesMap,
        isInClusterMode: isInClusterModeSelector(state),
        fileOrFolderContainedIn: state.main.resourceFilter.fileOrFolderContainedIn || '',
        previewValuesFileId: state.main.preview?.type === 'helm' ? state.main.preview.valuesFileId : undefined,
        isFolderOpen: Boolean(state.main.fileMap[ROOT_FILE_ENTRY]),
        selectedHelmValuesId:
          state.main.selection?.type === 'helm.values.file' ? state.main.selection.valuesFileId : undefined,
        [helmChart.id]: state.main.helmChartMap[helmChart.id],
      };
    },
    builder: {
      getRawItems: scope => {
        const currentHelmChart = scope[helmChart.id] as HelmChart | undefined;
        if (!currentHelmChart) {
          return [];
        }
        return currentHelmChart.valueFileIds
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
    customization: {
      counterDisplayMode: 'items',
      indentation: 10,
      nameWeight: 400,
      nameSize: 14,
      nameColor: Colors.grey9,
      nameHorizontalPadding: 0,
      namePrefix: {
        component: CollapseSectionPrefix,
      },
    },
    itemBlueprint: {
      getName: rawItem => rawItem.name,
      getInstanceId: rawItem => rawItem.id,
      builder: {
        isSelected: (rawItem, scope) => {
          return rawItem.id === scope.selectedHelmValuesId;
        },
        isDisabled: (rawItem, scope) =>
          Boolean(
            (scope.previewValuesFileId && scope.previewValuesFileId !== rawItem.id) ||
              scope.isInClusterMode ||
              !rawItem.filePath.startsWith(scope.fileOrFolderContainedIn)
          ),
        getMeta: () => {
          return {
            itemPrefixStyle: {
              paddingLeft: 10,
            },
            itemPrefixIcon: 'helm',
          };
        },
      },
      instanceHandler: {
        onClick: (itemInstance, dispatch) => {
          dispatch(selectHelmValuesFile({valuesFileId: itemInstance.id}));
        },
      },
      customization: {
        contextMenu: {component: HelmChartContextMenu, options: {isVisibleOnHover: true}},
        contextMenuWrapper: {component: HelmChartContextMenuWrapper, options: {isVisibleOnHover: false}},
        quickAction: {
          component: HelmChartQuickAction,
          options: {isVisibleOnHover: true},
        },
        prefix: {
          component: ItemPrefix,
        },
        lastItemMarginBottom: 0,
      },
    },
  };

  const helmChartSectionBlueprint: SectionBlueprint<HelmChart, HelmChartScopeType> = {
    id: helmChart.id,
    name: helmChart.name,
    containerElementId: 'helm-sections-container',
    rootSectionId: HELM_CHART_SECTION_NAME,
    childSectionIds: [
      valuesFilesSectionBlueprint.id,
      templateFilesSectionBlueprint.id,
      previewConfigurationsSectionBlueprint.id,
    ],
    getScope: state => {
      return {
        isInClusterMode: isInClusterModeSelector(state),
        fileOrFolderContainedIn: state.main.resourceFilter.fileOrFolderContainedIn || '',
        previewValuesFileId: state.main.preview?.type === 'helm' ? state.main.preview.valuesFileId : undefined,
        selectedFile: state.main.selection?.type === 'file' ? state.main.selection.filePath : undefined,
        [helmChart.id]: state.main.helmChartMap[helmChart.id],
      };
    },
    builder: {
      transformName: (_, scope) => {
        const currentHelmChart = scope[helmChart.id] as HelmChart | undefined;
        if (!currentHelmChart) {
          return 'Unnamed';
        }
        return currentHelmChart.name;
      },
      getRawItems: scope => {
        const currentHelmChart = scope[helmChart.id] as HelmChart | undefined;
        if (!currentHelmChart) {
          return [];
        }
        return [currentHelmChart];
      },
    },
    itemBlueprint: {
      getName: () => 'Chart.yaml',
      getInstanceId: chart => chart.id,
      builder: {
        getMeta: chart => ({
          filePath: chart.filePath,
          itemPrefixIcon: 'helm',
        }),
        isSelected: (chart, scope) => {
          return scope.selectedFile === chart.filePath;
        },
        isDisabled: (rawItem, scope) =>
          Boolean(
            (scope.previewValuesFileId && scope.previewValuesFileId !== rawItem.id) ||
              scope.isInClusterMode ||
              !rawItem.filePath.startsWith(scope.fileOrFolderContainedIn)
          ),
      },
      instanceHandler: {
        onClick: (instance, dispatch) => {
          const filePath: string | undefined = instance.meta?.filePath;
          if (!filePath) {
            return;
          }
          dispatch(selectFile({filePath}));
        },
      },
      customization: {
        contextMenu: {component: HelmChartContextMenu, options: {isVisibleOnHover: true}},
        contextMenuWrapper: {component: HelmChartContextMenuWrapper, options: {isVisibleOnHover: false}},
        prefix: {component: ItemPrefix},
        lastItemMarginBottom: 0,
      },
    },
    customization: {
      counterDisplayMode: 'none',
      indentation: 0,
      nameWeight: 600,
      nameSize: 14,
      nameColor: Colors.grey9,
    },
  };

  return {
    helmChartSectionBlueprint,
    valuesFilesSectionBlueprint,
    previewConfigurationsSectionBlueprint,
    templateFilesSectionBlueprint,
  };
}
