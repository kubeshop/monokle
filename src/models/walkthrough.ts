export type WalkThroughCollection = 'novice' | 'release';

export type WalkThroughStep<C extends WalkThroughCollection = WalkThroughCollection> = C extends 'novice'
  ? 'template' | 'resource' | 'syntax' | 'kustomizeHelm'
  : 'compare' | 'images';

export type WalkThroughContentProps = {
  data: {
    step: WalkThroughStep;
    title: string;
    content: string;
  };
  collection: WalkThroughCollection;
  currentStep: number;
};

export enum StepEnum {
  Previous = -1,
  Next = 1,
}
