import {monaco} from 'react-monaco-editor';

import {K8sResource} from '@models/k8sresource';

import {isDefined} from '@utils/filter';

import {GlyphDecorationTypes} from '../editorConstants';
import {createGlyphDecoration, createMarkdownString} from '../editorHelpers';

const applyErrorIntel = (
  resource: K8sResource
): {
  decorations: monaco.editor.IModelDeltaDecoration[];
} => {
  const validations = resource.validation?.errors ?? [];

  const glyphs = validations.map(validation => {
    const message = [createMarkdownString(`${validation.message}`)].filter(isDefined);

    return createGlyphDecoration(validation.errorPos?.line ?? 1, GlyphDecorationTypes.ErrorRef, message);
  });

  return {decorations: glyphs};
};

export default applyErrorIntel;
