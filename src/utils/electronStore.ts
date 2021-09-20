const ElectronStore = require('electron-store');

const schema = {
  appConfig: {
    type: 'object',
    properties: {
      startupModalVisible: {
        type: 'boolean',
      },
      kubeconfig: {
        type: 'string',
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
          loadLastFolderOnStartup: {
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
    },
  },
  ui: {
    type: 'object',
    properties: {
      isSettingsOpen: {
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
          separatorEditRightXPosition: {
            type: 'number',
          },
          separatorLeftNavXPosition: {
            type: 'number',
          },
          separatorNavEditXPosition: {
            type: 'number',
          },
        },
      },
    },
  },
};

const defaults = {
  appConfig: {
    startupModalVisible: true,
    scanExcludes: ['node_modules', '**/.git', '**/pkg/mod/**', '**/.kube', '**/*.swp'],
    fileIncludes: ['*.yaml', '*.yml'],
    settings: {
      theme: 'dark',
      textSize: 'medium',
      language: 'en',
      helmPreviewMode: 'template',
      loadLastFolderOnStartup: true,
    },
    recentFolders: [],
  },
  ui: {
    isSettingsOpen: false,
    isNewResourceWizardOpen: false,
    leftMenu: {
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
      separatorEditRightXPosition: 0,
      separatorLeftNavXPosition: 0,
      separatorNavEditXPosition: 0,
    },
  },
};

const electronStore = new ElectronStore({
  schema,
  defaults,
});

// electronStore.delete('ui');

export default electronStore;
