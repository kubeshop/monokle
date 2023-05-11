import * as monaco from 'monaco-editor';
import {ILanguageFeaturesService} from 'monaco-editor/esm/vs/editor/common/services/languageFeatures.js';
import {OutlineModel} from 'monaco-editor/esm/vs/editor/contrib/documentSymbols/browser/outlineModel.js';
import {StandaloneServices} from 'monaco-editor/esm/vs/editor/standalone/browser/standaloneServices.js';

import {
  GlyphDecorationTypes,
  InlineDecorationTypes,
  getGlyphDecorationOptions,
  getInlineDecorationOptions,
} from './editor.constants';

export function isPositionInRange(position: monaco.IPosition, range: monaco.IRange) {
  return (
    position.lineNumber >= range.startLineNumber &&
    position.lineNumber <= range.endLineNumber &&
    position.column >= range.startColumn &&
    position.column <= range.endColumn
  );
}

export function isRangeInRange(innerRange: monaco.IRange, outerRange: monaco.IRange) {
  return (
    innerRange.startLineNumber >= outerRange.startLineNumber &&
    innerRange.startColumn >= outerRange.startColumn &&
    innerRange.endLineNumber <= outerRange.endLineNumber &&
    innerRange.endColumn <= outerRange.endColumn
  );
}

export function createMarkdownString(text: string, supportHtml?: boolean): monaco.IMarkdownString {
  return {isTrusted: true, value: text, supportHtml};
}

export function createGlyphDecoration(
  lineIndex: number,
  glyphDecorationType: GlyphDecorationTypes,
  hoverMessage?: monaco.IMarkdownString[]
) {
  const glyphDecoration: monaco.editor.IModelDeltaDecoration = {
    range: new monaco.Range(lineIndex, 1, lineIndex, 1),
    options: getGlyphDecorationOptions(glyphDecorationType, hoverMessage),
  };
  return glyphDecoration;
}

export function createInlineDecoration(range: monaco.IRange, inlineDecorationType: InlineDecorationTypes) {
  const inlineDecoration: monaco.editor.IModelDeltaDecoration = {
    range,
    options: getInlineDecorationOptions(inlineDecorationType),
  };
  return inlineDecoration;
}

export const getSymbols = async (model: monaco.editor.IModel) => {
  const {documentSymbolProvider} = StandaloneServices.get(ILanguageFeaturesService);
  const outline = await OutlineModel.create(documentSymbolProvider, model);
  const symbols = outline.asListOfDocumentSymbols();
  return symbols;
};
