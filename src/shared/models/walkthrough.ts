type WalkthroughCollection = 'novice' | 'release';

type WalkthroughStep<C extends WalkthroughCollection = WalkthroughCollection> = C extends 'novice'
  ? 'template' | 'resource' | 'syntax' | 'kustomizeHelm'
  : 'compare' | 'cluster';

type WalkthroughContentProps = {
  data: {
    step: WalkthroughStep;
    title: string;
    content: string;
  };
  collection: WalkthroughCollection;
  currentStep: number;
};

export enum StepEnum {
  Previous = -1,
  Next = 1,
}

export type {WalkthroughCollection, WalkthroughContentProps, WalkthroughStep};
