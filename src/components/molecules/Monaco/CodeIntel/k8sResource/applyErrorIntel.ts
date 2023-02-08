import {monaco} from 'react-monaco-editor';

import {createGlyphDecoration} from '@molecules/Monaco/editorHelpers';

import {K8sResource} from '@shared/models/k8sResource';

import {GlyphDecorationTypes} from '../../editorConstants';

const applyErrorIntel = (
  resource: K8sResource
): {
  decorations: monaco.editor.IModelDeltaDecoration[];
} => {
  // const validations = resource.validation?.errors ?? [];
  // TODO: re-implement after @monokle/validation
  const validations: any[] = [];

  const glyphs = validations.map(validation =>
    createGlyphDecoration(validation.errorPos?.line ?? 1, GlyphDecorationTypes.ErrorRef)
  );

  return {decorations: glyphs};
};

export default applyErrorIntel;
