import {WalkthroughContentProps} from '@models/walkthrough';

export const newReleaseFeaturesContent: WalkthroughContentProps['data'][] = [
  {
    step: 'cluster',
    title: 'Real time cluster mode',
    content:
      'See information about your running cluster, reducing the cognitive load involved in deploying and maintaining your application in Kubernetes.',
  },
  {
    step: 'compare',
    title: 'Compare subfolders',
    content:
      'Helpful when the main folder structure is complex and contains multiple subfolders with different content for the same resources.',
  },
];
