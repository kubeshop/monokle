import {monaco} from 'react-monaco-editor';

export enum GlyphDecorationTypes {
  UnsatisfiedRef,
  SatisfiedRef,
  IncomingRef,
  OutgoingRef,
}

export enum InlineDecorationTypes {
  UnsatisfiedRef,
  SatisfiedRef,
}

const glyphDecorationOptionsByType: Record<GlyphDecorationTypes, monaco.editor.IModelDecorationOptions> = {
  [GlyphDecorationTypes.UnsatisfiedRef]: {
    glyphMarginClassName: 'monokleEditorUnsatisfiedRefGlyphClass',
    glyphMarginHoverMessage: {value: 'Unsatisfied link'},
  },
  [GlyphDecorationTypes.SatisfiedRef]: {
    glyphMarginClassName: 'monokleEditorSatisfiedRefGlyphClass',
    glyphMarginHoverMessage: {value: 'Satisfied link'},
  },
  [GlyphDecorationTypes.IncomingRef]: {
    glyphMarginClassName: 'monokleEditorIncomingRefGlyphClass',
    glyphMarginHoverMessage: {value: 'Incoming link'},
  },
  [GlyphDecorationTypes.OutgoingRef]: {
    glyphMarginClassName: 'monokleEditorOutgoingRefGlyphClass',
    glyphMarginHoverMessage: {value: 'Outgoing link'},
  },
};

const inlineDecorationOptionsByType = {
  [GlyphDecorationTypes.UnsatisfiedRef]: {
    inlineClassName: 'monokleEditorUnsatisfiedRefInlineClass',
    overviewRuler: {
      position: monaco.editor.OverviewRulerLane.Left,
      color: '#ad8b00',
    },
  },
  [GlyphDecorationTypes.SatisfiedRef]: {
    inlineClassName: 'monokleEditorSatisfiedRefInlineClass',
    overviewRuler: {
      position: monaco.editor.OverviewRulerLane.Right,
      color: '#3C8618',
    },
  },
};

export function getGlyphDecorationOptions(
  glyphDecorationType: GlyphDecorationTypes,
  hoverMessage?: monaco.IMarkdownString[]
) {
  const glyphMarginHoverMessage =
    hoverMessage || glyphDecorationOptionsByType[glyphDecorationType]?.glyphMarginHoverMessage;

  return {
    ...glyphDecorationOptionsByType[glyphDecorationType],
    glyphMarginHoverMessage,
  };
}

export function getInlineDecorationOptions(inlineDecorationType: InlineDecorationTypes) {
  return inlineDecorationOptionsByType[inlineDecorationType];
}
