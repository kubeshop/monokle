import {ResourceRef} from '@models/k8sresource';

export const getRefRange = (ref: ResourceRef) => {
  if (!ref.position) {
    return undefined;
  }
  return {
    startLineNumber: ref.position.line,
    endLineNumber: ref.position.line,
    startColumn: ref.position.column,
    endColumn: ref.position.column + ref.position.length,
  };
};
