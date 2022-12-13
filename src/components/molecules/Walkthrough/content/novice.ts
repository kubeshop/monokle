import {WalkthroughContentProps} from '@models/walkthrough';

export const noviceContent: WalkthroughContentProps['data'][] = [
  {
    step: 'template',
    title: 'Find your projects here',
    content:
      'Create your projects by loading a folder with K8s resources, from scratch or using a template. See and manage your YAML files from the File Explorer.',
  },
  {
    step: 'resource',
    title: 'All resources and their relationships',
    content:
      'Check out all your K8s resources grouped by type, no matter how many they are. Search & filter them, learn about their dependencies and fix errors.',
  },
  // {
  //   step: 'syntax',
  //   title: 'Fix errors for a perfect syntax',
  //   content:
  //     'Get alerts for syntax errors. Follow suggestions for a fix on the fly. Find links to other resources right there in the code. Use forms for quick code writing.',
  // },
  {
    step: 'kustomizeHelm',
    title: 'Validate Kustomize and Helm output',
    content:
      'Check out and debug your Kustomize and Helm outputs. Change kustomizations and see effects on the generated resources.',
  },
];
