import {monaco} from 'react-monaco-editor';
import {v4 as uuidv4} from 'uuid';

// @ts-ignore
import {CommandsRegistry} from 'monaco-editor/esm/vs/platform/commands/common/commands';

type ILine = {
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

export function createGlyphDecoration(lineIndex: number) {
  const glyphDecoration: monaco.editor.IModelDeltaDecoration = {
    range: new monaco.Range(lineIndex, 1, lineIndex, 1),
    options: {
      glyphMarginClassName: 'monokleEditorUnsatisfiedRefGlyphClass',
      glyphMarginHoverMessage: {value: 'Unsatisfied link'},
    },
  };
  return glyphDecoration;
}

export function createInlineDecoration(range: monaco.IRange) {
  const inlineDecoration: monaco.editor.IModelDeltaDecoration = {
    range,
    options: {
      inlineClassName: 'monokleEditorUnsatisfiedRefInlineClass',
    },
  };
  return inlineDecoration;
}

export function createInlineHoverPopup(inlineRange: monaco.IRange) {
  const commandId = `cmd_${uuidv4()}`;
  const commandDisposable: monaco.IDisposable = CommandsRegistry.registerCommand(commandId, () => {
    alert('Clicked on the link!');
  });

  const hoverDisposable = monaco.languages.registerHoverProvider('yaml', {
    provideHover: () => {
      return {
        range: inlineRange,
        contents: [
          {isTrusted: true, value: `**Test Hover with links**`},
          {isTrusted: true, value: `[Some link](command:${commandId})`},
        ],
      };
    },
  });

  return {commandDisposable, hoverDisposable};
}

export function getLine(editor: monaco.editor.IStandaloneCodeEditor, target: string): ILine | null {
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

export function getInlineRangeForTarget(line: ILine, target: string) {
  let columnStart = line.content.indexOf(target);
  if (columnStart === -1) {
    return null;
  }
  columnStart += 1; // ranges use 1-based indexing
  return new monaco.Range(line.index, columnStart, line.index, columnStart + target.length);
}
