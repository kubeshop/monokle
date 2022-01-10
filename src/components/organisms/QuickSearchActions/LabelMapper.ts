export default {
  namespace: 'Filter by Namespace',
  kind: 'Filter by Kind',
  resource: 'Resources',
};

export const optionsTypes = ['namespace', 'kind', 'resource'];

const types = ['namespace', 'kind', 'resource'] as const;
export type LabelTypes = typeof types[number];
