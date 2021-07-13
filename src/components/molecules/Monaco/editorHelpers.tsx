import {monaco} from 'react-monaco-editor';
import {v4 as uuidv4} from 'uuid';

// @ts-ignore
import {CommandsRegistry} from 'monaco-editor/esm/vs/platform/commands/common/commands';

import {
  GlyphDecorationTypes,
  InlineDecorationTypes,
  getGlyphDecorationOptions,
  getInlineDecorationOptions,
} from './editorConstants';

type Line = {
  content: string;
  index: number;
};

export function clearDecorations(editor: monaco.editor.IStandaloneCodeEditor, idsOfDecorations: string[]) {
  editor.deltaDecorations(idsOfDecorations, []);
}

export function setDecorations(
  editor: monaco.editor.IStandaloneCodeEditor,
  decorations: monaco.editor.IModelDeltaDecoration[]
) {
  const decorationIds = editor.deltaDecorations([], decorations);
  return decorationIds;
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
    provideHover: () => {
      return {
        range,
        contents,
      };
    },
  });
  return hoverDisposable;
}

export function getLine(editor: monaco.editor.IStandaloneCodeEditor, target: string): Line | null {
  const model = editor.getModel();
  if (!model) {
    return null;
  }
  for (let index = 1; index <= model.getLineCount(); index += 1) {
    const content = model.getLineContent(index);
    if (content.includes(target)) {
      return {index, content};
    }
  }
  return null;
}

export function getRangeForTarget(line: Line, target: string) {
  let columnStart = line.content.indexOf(target);
  if (columnStart === -1) {
    return null;
  }
  columnStart += 1; // ranges use 1-based indexing
  return new monaco.Range(line.index, columnStart, line.index, columnStart + target.length);
}
