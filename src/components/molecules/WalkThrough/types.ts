export type WalkThroughStep = 'template' | 'resource' | 'syntax' | 'cluster' | 'kustomizeHelm' | 'validation';
export type WalkThroughContentProps = {
  data: {
    step: WalkThroughStep;
    title: string;
    content: string;
  };
  currentStep: number;
};

export enum StepEnum {
  Previous = -1,
  Next = 1,
}
