import {AppState} from '@models/appstate';
import {AppConfig, NewVersionCode} from '@models/appconfig';
import {AlertState} from '@models/alert';
import {LogsState} from '@models/logs';
import {UiState} from '@models/ui';
import electronStore from '@utils/electronStore';
import {ObjectNavigator, NavigatorSection, NavigatorSubSection} from '@models/navigator';
import {ResourceKindHandlers} from '@src/kindhandlers';
import navSectionNames from '@constants/navSectionNames';

const NAV_K8S_RESOURCES_SECTIONS_ORDER = navSectionNames.representation[navSectionNames.K8S_RESOURCES];

const initialAppState: AppState = {
  selectionHistory: [],
  resourceMap: {},
  resourceFilter: {
    labels: {},
    annotations: {},
  },
  fileMap: {},
  helmChartMap: {},
  helmValuesMap: {},
  previewLoader: {
    isLoading: false,
  },
  isSelectingFile: false,
  isApplyingResource: false,
  plugins: [],
  resourceRefsProcessingOptions: {
    shouldIgnoreOptionalUnsatisfiedRefs:
      electronStore.get('main.resourceRefsProcessingOptions.shouldIgnoreOptionalUnsatisfiedRefs') || true,
  },
};

const navigators = Object.values(
  ResourceKindHandlers.reduce<Record<string, ObjectNavigator>>((navigatorsByName, kindHandler) => {
    const [navigatorName, sectionName, subsectionName] = kindHandler.navigatorPath;
    const currentNavigator: ObjectNavigator = navigatorsByName[navigatorName] || {
      name: navigatorName,
      sections: [],
    };

    const newSubsection: NavigatorSubSection = {
      name: subsectionName,
      kindSelector: kindHandler.kind,
      apiVersionSelector: kindHandler.apiVersionMatcher,
    };

    const currentSection: NavigatorSection | undefined = currentNavigator.sections.find(s => s.name === sectionName);
    if (currentSection) {
      currentSection.subsections = [...currentSection.subsections, newSubsection];
    }

    let newNavigatorSections = currentNavigator.sections;

    if (!currentSection) {
      const newSection = {
        name: sectionName,
        subsections: [newSubsection],
      };

      const newSectionIndex = newNavigatorSections.findIndex(section => {
        if (
          NAV_K8S_RESOURCES_SECTIONS_ORDER.indexOf(section.name) >
          NAV_K8S_RESOURCES_SECTIONS_ORDER.indexOf(newSection.name)
        ) {
          return true;
        }
        return false;
      });

      if (newSectionIndex === -1) {
        newNavigatorSections.push(newSection);
      } else {
        newNavigatorSections.splice(newSectionIndex, 0, newSection);
      }
    }

    return {
      ...navigatorsByName,
      [navigatorName]: {
        ...currentNavigator,
        sections: newNavigatorSections,
      },
    };
  }, {})
);

const initialAppConfigState: AppConfig = {
  isStartupModalVisible: electronStore.get('appConfig.startupModalVisible'),
  kubeconfigPath: '',
  settings: {
    filterObjectsOnSelection: false,
    autoZoomGraphOnSelection: true,
    helmPreviewMode: electronStore.get('appConfig.settings.helmPreviewMode') || 'template',
    theme: electronStore.get('appConfig.settings.theme'),
    textSize: electronStore.get('appConfig.settings.textSize'),
    language: electronStore.get('appConfig.settings.language'),
    loadLastFolderOnStartup: electronStore.get('appConfig.settings.loadLastFolderOnStartup'),
  },
  scanExcludes: electronStore.get('appConfig.scanExcludes') || [],
  fileIncludes: electronStore.get('appConfig.fileIncludes') || [],
  folderReadsMaxDepth: electronStore.get('appConfig.folderReadsMaxDepth') || 10,
  recentFolders: electronStore.get('appConfig.recentFolders') || [],
  newVersion: {
    code: electronStore.get('appConfig.newVersion') || NewVersionCode.Idle,
    data: {
      initial: true,
    },
  },
  navigators,
  kubeConfig: {
    contexts: [],
    currentContext: undefined,
  },
};

const initialAlertState: AlertState = {};

const initialLogsState: LogsState = {
  logs: [''],
};

const initialUiState: UiState = {
  isSettingsOpen: electronStore.get('ui.isSettingsOpen'),
  isFolderLoading: false,
  newResourceWizard: {
    isOpen: electronStore.get('ui.isNewResourceWizardOpen'),
  },
  renameResourceModal: {
    isOpen: false,
    resourceId: '',
  },
  leftMenu: {
    selection: electronStore.get('ui.leftMenu.selection'),
    isActive: electronStore.get('ui.leftMenu.isActive'),
  },
  rightMenu: {
    isActive: electronStore.get('ui.rightMenu.isActive'),
  },
  folderExplorer: {
    isOpen: false,
  },
  monacoEditor: {
    focused: false,
    undo: false,
    redo: false,
    find: false,
    replace: false,
    apply: false,
    diff: false,
  },
  navPane: {
    collapsedNavSectionNames: [],
  },
  validationErrorsModal: {
    isVisible: false,
    errors: [],
  },
  paneConfiguration: electronStore.get('ui.paneConfiguration'),
  shouldExpandAllNodes: false,
  resetLayout: false,
};

export default {
  alert: initialAlertState,
  config: initialAppConfigState,
  main: initialAppState,
  logs: initialLogsState,
  ui: initialUiState,
};
