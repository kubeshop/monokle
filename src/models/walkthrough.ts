export type WalkthroughCollection = 'novice' | 'release';

export type WalkthroughStep<C extends WalkthroughCollection = WalkthroughCollection> = C extends 'novice'
  ? 'template' | 'resource' | 'syntax' | 'kustomizeHelm'
  : 'compare' | 'images';

export type WalkthroughContentProps = {
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
