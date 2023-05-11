import {monaco} from 'react-monaco-editor';

import {DiagnosticsOptions} from 'monaco-yaml';

import {Colors} from '@shared/styles/colors';

import {KUBESHOP_MONACO_THEME} from './editor.theme';

export const MONACO_EDITOR_INITIAL_CONFIG: monaco.editor.IStandaloneEditorConstructionOptions = {
  selectOnLineNumbers: true,
  readOnly: false,
  renderValidationDecorations: 'on',
  fontWeight: 'bold',
  language: 'yaml',
  theme: KUBESHOP_MONACO_THEME,
  tabSize: 2,
  scrollBeyondLastLine: false,
  glyphMargin: true,
  minimap: {
    enabled: true,
  },
};

export const MONACO_YAML_BASE_DIAGNOSTICS_OPTIONS: DiagnosticsOptions = {
  enableSchemaRequest: true,
  hover: true,
  completion: true,
  format: true,
};

export const MODEL_OWNER = 'monokle';

export enum GlyphDecorationTypes {
  UnsatisfiedRef,
  SatisfiedRef,
  IncomingRef,
  OutgoingRef,
  PolicyIssue,
  ErrorRef,
  OutgoingImageRef,
}

export enum InlineDecorationTypes {
  UnsatisfiedRef,
  SatisfiedRef,
  PolicyIssue,
  Match,
  CurrentMatch,
  LastModified,
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
  [GlyphDecorationTypes.OutgoingImageRef]: {
    glyphMarginClassName: 'monokleEditorOutgoingImageRefGlyphClass',
    glyphMarginHoverMessage: {value: 'Image link'},
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
  [InlineDecorationTypes.Match]: {
    inlineClassName: 'monokleEditorMatchInlineClass',
  },
  [InlineDecorationTypes.CurrentMatch]: {
    inlineClassName: 'monokleEditorCurrentMatchInlineClass',
  },
  [InlineDecorationTypes.LastModified]: {
    inlineClassName: 'monokleEditorLastModifiedLineInlineClass',
    isWholeLine: true,
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
