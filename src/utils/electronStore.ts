const ElectronStore = require('electron-store');

const schema = {
  appConfig: {
    type: 'object',
    properties: {
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
        },
      },
    },
  },
};

const defaults = {
  appConfig: {
    scanExcludes: ['node_modules', '**/.git', '**/pkg/mod/**', '**/.kube'],
    fileIncludes: ['*.yaml', '*.yml'],
    settings: {
      theme: 'dark',
      textSize: 'medium',
      language: 'en',
      helmPreviewMode: 'template',
    },
  },
};

const electronStore = new ElectronStore({
  schema,
  defaults,
});

export default electronStore;
