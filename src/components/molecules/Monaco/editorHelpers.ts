import {monaco} from 'react-monaco-editor';

// @ts-ignore
import {getDocumentSymbols} from 'monaco-editor/esm/vs/editor/contrib/documentSymbols/documentSymbols';
// @ts-ignore
import {CommandsRegistry} from 'monaco-editor/esm/vs/platform/commands/common/commands';
import {v4 as uuidv4} from 'uuid';

import {
  GlyphDecorationTypes,
  InlineDecorationTypes,
  getGlyphDecorationOptions,
  getInlineDecorationOptions,
} from './editorConstants';

export function clearDecorations(editor: monaco.editor.IStandaloneCodeEditor, idsOfDecorations: string[]) {
  editor.deltaDecorations(idsOfDecorations, []);
}

export function setDecorations(
  editor: monaco.editor.IStandaloneCodeEditor,
  newDecorations: monaco.editor.IModelDeltaDecoration[],
  idsOfOldDecorations: string[] = []
) {
  return editor.deltaDecorations(idsOfOldDecorations, newDecorations);
}

export function createGlyphDecoration(lineIndex: number, glyphDecorationType: GlyphDecorationTypes) {
  const glyphDecoration: monaco.editor.IModelDeltaDecoration = {
    range: new monaco.Range(lineIndex, 1, lineIndex, 1),
    options: getGlyphDecorationOptions(glyphDecorationType),
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
  handler: monaco.editor.ICommandHandler
): {commandMarkdownLink: monaco.IMarkdownString; commandDisposable: monaco.IDisposable} {
  const commandId = `cmd_${uuidv4()}`;
  const commandDisposable: monaco.IDisposable = CommandsRegistry.registerCommand(commandId, handler);

  return {
    commandMarkdownLink: {
      isTrusted: true,
      value: `[${text}](command:${commandId})`,
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

const getSymbols = async (model: monaco.editor.IModel) => {
  const symbols = await getDocumentSymbols(model, false, {
    isCancellationRequested: false,
    onCancellationRequested: () => {
      return {
        dispose() {},
      };
    },
  });
  return symbols;
};

export const getSymbolsBeforePosition = async (model: monaco.editor.IModel, position: monaco.IPosition) => {
  const symbols = await getSymbols(model);
  return flattenSymbols(symbols).filter(symbol => isPositionAfterRange(position, symbol.range));
};

export function createCompletionProvider(provider: monaco.languages.CompletionItemProvider) {
  return monaco.languages.registerCompletionItemProvider('yaml', provider);
}
