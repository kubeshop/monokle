import {monaco} from 'react-monaco-editor';

import Colors from '@styles/Colors';

export const MODEL_OWNER = 'monokle';

export enum GlyphDecorationTypes {
  UnsatisfiedRef,
  SatisfiedRef,
  IncomingRef,
  OutgoingRef,
  PolicyIssue,
  ErrorRef,
}

export enum InlineDecorationTypes {
  UnsatisfiedRef,
  SatisfiedRef,
  PolicyIssue,
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
  [GlyphDecorationTypes.PolicyIssue]: {
    glyphMarginClassName: 'monokleEditorPolicyIssueGlyphClass',
    glyphMarginHoverMessage: {value: 'Policy issue'},
  },
  [GlyphDecorationTypes.ErrorRef]: {
    glyphMarginClassName: 'monokleEditorErrorRefGlyphClass',
  },
};

const inlineDecorationOptionsByType: Record<InlineDecorationTypes, monaco.editor.IModelDecorationOptions> = {
  [InlineDecorationTypes.UnsatisfiedRef]: {
    inlineClassName: 'monokleEditorUnsatisfiedRefInlineClass',
    overviewRuler: {
      position: monaco.editor.OverviewRulerLane.Left,
      color: Colors.yellow7,
    },
  },
  [InlineDecorationTypes.SatisfiedRef]: {
    inlineClassName: 'monokleEditorSatisfiedRefInlineClass',
    overviewRuler: {
      position: monaco.editor.OverviewRulerLane.Right,
      color: '#3C8618',
    },
  },
  [InlineDecorationTypes.PolicyIssue]: {
    inlineClassName: 'monokleEditorPolicyIssueInlineClass',
    overviewRuler: {
      position: monaco.editor.OverviewRulerLane.Left,
      color: Colors.red7,
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
