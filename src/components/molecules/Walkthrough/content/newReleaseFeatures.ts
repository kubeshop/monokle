import {WalkthroughContentProps} from '@models/walkthrough';

export const newReleaseFeaturesContent: WalkthroughContentProps['data'][] = [
  {
    step: 'cluster',
    title: 'Cluster mode',
    content:
      'Day-to-day debugging and validation tasks made easy with real-time insights into the state of deployed clusters and contained resources.',
  },
  {
    step: 'compare',
    title: 'Compare subfolders',
    content:
      'Helpful when the main folder structure is complex and contains multiple subfolders with different content for the same resources.',
  },
];
