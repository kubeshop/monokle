import {AppState} from '@models/appstate';
import {AppConfig} from '@models/appconfig';
import {AlertState} from '@models/alert';
import {LogsState} from '@models/logs';
import {UiState} from '@models/ui';
import electronStore from '@utils/electronStore';
import {ObjectNavigator, NavigatorSection, NavigatorSubSection} from '@models/navigator';
import {ResourceKindHandlers} from '@src/kindhandlers';

const initialAppState: AppState = {
  resourceMap: {},
  fileMap: {},
  helmChartMap: {},
  helmValuesMap: {},
  previewLoader: {
    isLoading: false,
  },
  isSelectingFile: false,
  isApplyingResource: false,
};

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
  },
  scanExcludes: electronStore.get('appConfig.scanExcludes'),
  fileIncludes: electronStore.get('appConfig.fileIncludes'),
  navigators: Object.values(
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

      let currentSection: NavigatorSection | undefined = currentNavigator.sections.find(s => s.name === sectionName);
      let foundSection = currentSection !== undefined;

      if (currentSection) {
        currentSection.subsections = [...currentSection.subsections, newSubsection];
      } else {
        currentSection = {
          name: sectionName,
          subsections: [newSubsection],
        };
      }

      return {
        ...navigatorsByName,
        [navigatorName]: {
          ...currentNavigator,
          sections: foundSection ? currentNavigator.sections : [...currentNavigator.sections, currentSection],
        },
      };
    }, {})
  ),
};

const initialAlertState: AlertState = {};

const initialLogsState: LogsState = {
  logs: [''],
};

const initialUiState: UiState = {
  isSettingsOpen: false,
  isFolderLoading: false,
  leftMenu: {
    selection: 'file-explorer',
    isActive: true,
  },
  rightMenu: {
    isActive: false,
  },
};

export default {
  alert: initialAlertState,
  config: initialAppConfigState,
  main: initialAppState,
  logs: initialLogsState,
  ui: initialUiState,
};
