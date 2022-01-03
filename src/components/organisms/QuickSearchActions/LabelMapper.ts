export default {
  namespace: 'Filter by Namespace',
  kind: 'Filter by Kind',
};

export const optionsTypes = ['namespace', 'kind'];

const types = ['namespace', 'kind'] as const;
export type LabelTypes = typeof types[number];
