import {monaco} from 'react-monaco-editor';

import {createGlyphDecoration} from '@molecules/Monaco/editorHelpers';

import {K8sResource} from '@monokle-desktop/shared/models/k8sResource';

import {GlyphDecorationTypes} from '../../editorConstants';

const applyErrorIntel = (
  resource: K8sResource
): {
  decorations: monaco.editor.IModelDeltaDecoration[];
} => {
  const validations = resource.validation?.errors ?? [];

  const glyphs = validations.map(validation =>
    createGlyphDecoration(validation.errorPos?.line ?? 1, GlyphDecorationTypes.ErrorRef)
  );

  return {decorations: glyphs};
};

export default applyErrorIntel;
