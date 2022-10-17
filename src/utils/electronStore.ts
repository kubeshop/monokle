import {PREDEFINED_K8S_VERSION} from '@constants/constants';

const ElectronStore = require('electron-store');

const schema = {
  main: {
    type: 'object',
    properties: {
      resourceRefsProcessingOptions: {
        type: 'object',
        properties: {
          shouldIgnoreOptionalUnsatisfiedRefs: {
            type: 'boolean',
          },
        },
      },
      deviceID: {
        type: 'string',
      },
      filtersPresets: {
        type: 'object',
      },
    },
  },
  appConfig: {
    type: 'object',
    properties: {
      kubeConfigContextsColors: {
        type: 'object',
      },
      hasDeletedDefaultTemplatesPlugin: {
        type: 'boolean',
      },
      lastSeenReleaseNotesVersion: {
        type: 'string',
      },
      isClusterSelectorVisible: {
        type: 'boolean',
      },
      loadLastProjectOnStartup: {
        type: 'boolean',
      },
      scanExcludes: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      fileIncludes: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      settings: {
        type: 'object',
        properties: {
          theme: {
            type: 'string',
          },
          textSize: {
            type: 'string',
          },
          language: {
            type: 'string',
          },
          helmPreviewMode: {
            type: 'string',
          },
          kustomizeCommand: {
            type: 'string',
          },
          hideExcludedFilesInFileExplorer: {
            type: 'boolean',
          },
          hideUnsupportedFilesInFileExplorer: {
            type: 'boolean',
          },
          enableHelmWithKustomize: {
            type: 'boolean',
          },
          createDefaultObjects: {
            type: 'boolean',
          },
          setDefaultPrimitiveValues: {
            type: 'boolean',
          },
          allowEditInClusterMode: {
            type: 'boolean',
          },
        },
      },
      recentFolders: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      newVersion: {
        type: 'number',
      },
      k8sVersion: {
        type: 'string',
      },
      projects: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            rootFolder: {
              type: 'string',
            },
            k8sVersion: {
              type: 'string',
            },
            lastOpened: {
              type: 'string',
            },
          },
        },
      },
      projectsRootFolder: {
        type: 'string',
      },
      favoriteTemplates: {
        type: 'array',
      },
      disableEventTracking: {
        type: 'boolean',
      },
      disableErrorReporting: {
        type: 'boolean',
      },
    },
  },
  ui: {
    type: 'object',
    properties: {
      isSettingsOpen: {
        type: 'boolean',
      },
      isNotificationsOpen: {
        type: 'boolean',
      },
      isNewResourceWizardOpen: {
        type: 'boolean',
      },
      isFolderLoading: {
        type: 'boolean',
      },
      leftMenu: {
        type: 'object',
        properties: {
          bottomSelection: {
            type: ['string', 'null'],
          },
          selection: {
            type: 'string',
          },
          isActive: {
            type: 'boolean',
          },
        },
      },
      rightMenu: {
        type: 'object',
        properties: {
          selection: {
            type: 'string',
          },
          isActive: {
            type: 'boolean',
          },
        },
      },
      paneConfiguration: {
        type: 'object',
        properties: {
          leftWidth: {
            type: 'number',
          },
          navWidth: {
            type: 'number',
          },
          editWidth: {
            type: 'number',
          },
          rightWidth: {
            type: 'number',
          },
        },
      },
      zoomFactor: {
        type: 'number',
      },
    },
  },
  uiCoach: {
    type: 'object',
    properties: {
      hasUserPerformedClickOnClusterIcon: {
        type: 'boolean',
      },
    },
  },
  kubeConfig: {
    type: 'object',
    properties: {
      namespaces: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            namespaceName: {
              type: 'string',
            },
            clusterName: {
              type: 'string',
            },
          },
        },
      },
      contextsWithRemovedNamespace: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
  },
  pluginConfig: {
    type: 'object',
    properties: {
      policies: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            enabled: {
              type: 'boolean',
            },
            enabledRules: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  },
  terminal: {
    type: 'object',
    properties: {
      settings: {
        type: 'object',
        properties: {
          defaultShell: {
            type: 'string',
          },
          fontSize: {
            type: 'number',
          },
        },
      },
    },
  },
};

const defaults = {
  main: {
    filtersPresets: {},
  },
  appConfig: {
    kubeConfigContextsColors: {},
    isClusterSelectorVisible: true,
    loadLastProjectOnStartup: false,
    scanExcludes: ['node_modules', '**/.git', '**/pkg/mod/**', '**/.kube', '**/*.swp', '.monokle'],
    fileIncludes: ['*.yaml', '*.yml'],
    settings: {
      theme: 'dark',
      textSize: 'medium',
      language: 'en',
      helmPreviewMode: 'template',
      createDefaultObjects: false,
      setDefaultPrimitiveValues: true,
      allowEditInClusterMode: true,
    },
    recentFolders: [],
    newVersion: 0,
    k8sVersion: PREDEFINED_K8S_VERSION,
    hasDeletedDefaultTemplatesPlugin: false,
  },
  ui: {
    isSettingsOpen: false,
    isNewResourceWizardOpen: false,
    leftMenu: {
      bottomSelection: null,
      selection: 'file-explorer',
      isActive: true,
    },
    rightMenu: {
      selection: '',
      isActive: false,
    },
    paneConfiguration: {
      leftWidth: 0.3333,
      navWidth: 0.3333,
      editWidth: 0.3333,
      rightWidth: 0,
    },
    zoomFactor: 1,
  },
  kubeConfig: {
    namespaces: [],
    contextsWithRemovedNamespace: [],
  },
  pluginConfig: {
    policies: [],
  },
  terminal: {
    settings: {
      defaultShell: '',
      fontSize: 14,
    },
  },
};

const electronStore = new ElectronStore({
  schema,
  defaults,
});

export default electronStore;
