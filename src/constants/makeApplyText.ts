export const makeApplyKustomizationText = (name: string, context: string) =>
  `Deploy ${name} kustomization to cluster [${context}]?`;

export const makeApplyResourceText = (name: string, context: string) => `Deploy ${name} to cluster [${context}]?`;

export const makeApplyMultipleResourcesText = (length: number, context: string) =>
  `Deploy selected resources (${length}) to cluster [${context}]?`;
