import {monaco} from 'react-monaco-editor';

// @ts-ignore
import {ILanguageFeaturesService} from 'monaco-editor/esm/vs/editor/common/services/languageFeatures.js';
// @ts-ignore
import {OutlineModel} from 'monaco-editor/esm/vs/editor/contrib/documentSymbols/browser/outlineModel.js';
// @ts-ignore
import {StandaloneServices} from 'monaco-editor/esm/vs/editor/standalone/browser/standaloneServices.js';
// @ts-ignore
import {CommandsRegistry} from 'monaco-editor/esm/vs/platform/commands/common/commands';
import {v4 as uuidv4} from 'uuid';

import {
  GlyphDecorationTypes,
  InlineDecorationTypes,
  MODEL_OWNER,
  getGlyphDecorationOptions,
  getInlineDecorationOptions,
} from './editorConstants';

export function clearDecorations(editor: monaco.editor.IStandaloneCodeEditor, idsOfDecorations: string[]) {
  editor.removeDecorations(idsOfDecorations);
}

export function setDecorations(
  editor: monaco.editor.IStandaloneCodeEditor,
  newDecorations: monaco.editor.IModelDeltaDecoration[],
  idsOfOldDecorations: string[] = []
) {
  return editor.deltaDecorations(idsOfOldDecorations, newDecorations);
}

export function createMarker(ruleId: string, message: string, range: monaco.Range): monaco.editor.IMarkerData {
  return {
    message,
    source: `(${ruleId})`,
    startLineNumber: range.startLineNumber,
    startColumn: range.startColumn,
    endLineNumber: range.endLineNumber,
    endColumn: range.endColumn,
    severity: monaco.MarkerSeverity.Error,
  };
}

export function setMarkers(model: monaco.editor.ITextModel, markers: monaco.editor.IMarkerData[]) {
  return monaco.editor.setModelMarkers(model, MODEL_OWNER, markers);
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

export function createMarkdownString(text: string): monaco.IMarkdownString {
  return {isTrusted: true, value: text};
}

export function createCommandMarkdownLink(
  text: string,
  altText: string,
  handler: monaco.editor.ICommandHandler,
  beforeText?: string,
  afterText?: string
): {commandMarkdownLink: monaco.IMarkdownString; commandDisposable: monaco.IDisposable} {
  const commandId = `cmd_${uuidv4()}`;
  const commandDisposable: monaco.IDisposable = CommandsRegistry.registerCommand(commandId, handler);

  return {
    commandMarkdownLink: {
      isTrusted: true,
      value: `${beforeText || ''}[${text}](command:${commandId} '${altText}')${afterText || ''}`,
    },
    commandDisposable,
  };
}

export function createHoverProvider(range: monaco.IRange, contents: monaco.IMarkdownString[]) {
  const hoverDisposable: monaco.IDisposable = monaco.languages.registerHoverProvider('yaml', {
    provideHover: (model: monaco.editor.ITextModel, position: monaco.Position) => {
      if (
        position.lineNumber >= range.startLineNumber &&
        position.lineNumber <= range.endLineNumber &&
        position.column >= range.startColumn &&
        position.column <= range.endColumn
      ) {
        return {
          range,
          contents,
        };
      }
      return null;
    },
  });
  return hoverDisposable;
}

export function createLinkProvider(range: monaco.IRange, tooltip: string, handler: () => void) {
  const linkDisposable: monaco.IDisposable = monaco.languages.registerLinkProvider('yaml', {
    provideLinks: () => {
      return {
        links: [
          {
            range,
            tooltip,
          },
        ],
      };
    },
    resolveLink: (link: monaco.languages.ILink) => {
      handler();
      return {range: link.range};
    },
  });
  return linkDisposable;
}

const flattenSymbols = (symbols: monaco.languages.DocumentSymbol[]) => {
  const result: monaco.languages.DocumentSymbol[] = [];
  symbols.forEach(currentSymbol => {
    result.push(currentSymbol);
    if (currentSymbol.children && currentSymbol.children.length > 0) {
      const flatChildrenSymbols = flattenSymbols(currentSymbol.children);
      result.push(...flatChildrenSymbols);
    }
  });
  return result;
};

const isPositionAfterRange = (position: monaco.IPosition, range: monaco.IRange) => {
  return position.column > range.startColumn && position.lineNumber >= range.startLineNumber;
};

export const getSymbols = async (model: monaco.editor.IModel) => {
  const {documentSymbolProvider} = StandaloneServices.get(ILanguageFeaturesService);
  const outline = await OutlineModel.create(documentSymbolProvider, model);
  const symbols = outline.asListOfDocumentSymbols();
  return symbols;
};

export const getSymbolsBeforePosition = async (model: monaco.editor.IModel, position: monaco.IPosition) => {
  const symbols = await getSymbols(model);
  return flattenSymbols(symbols).filter(symbol => isPositionAfterRange(position, symbol.range));
};

export function createCompletionProvider(provider: monaco.languages.CompletionItemProvider) {
  return monaco.languages.registerCompletionItemProvider('yaml', provider);
}
