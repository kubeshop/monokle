export enum GlyphDecorationTypes {
  UnsatisfiedRef,
  SatisfiedRef,
}

export enum InlineDecorationTypes {
  UnsatisfiedRef,
  SatisfiedRef,
}

const glyphDecorationOptionsByType = {
  [GlyphDecorationTypes.UnsatisfiedRef]: {
    glyphMarginClassName: 'monokleEditorUnsatisfiedRefGlyphClass',
    glyphMarginHoverMessage: {value: 'Unsatisfied link'},
  },
  [GlyphDecorationTypes.SatisfiedRef]: {
    glyphMarginClassName: 'monokleEditorSatisfiedRefGlyphClass',
    glyphMarginHoverMessage: {value: 'Satisfied link'},
  },
};

const inlineDecorationOptionsByType = {
  [GlyphDecorationTypes.UnsatisfiedRef]: {
    inlineClassName: 'monokleEditorUnsatisfiedRefInlineClass',
  },
  [GlyphDecorationTypes.SatisfiedRef]: {
    inlineClassName: 'monokleEditorSatisfiedRefInlineClass',
  },
};

export function getGlyphDecorationOptions(glyphDecorationType: GlyphDecorationTypes) {
  return glyphDecorationOptionsByType[glyphDecorationType];
}

export function getInlineDecorationOptions(inlineDecorationType: InlineDecorationTypes) {
  return inlineDecorationOptionsByType[inlineDecorationType];
}
