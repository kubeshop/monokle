import log from 'loglevel';
import * as monaco from 'monaco-editor';
import {v4 as uuidv4} from 'uuid';

import {MONACO_EDITOR_INITIAL_CONFIG} from './editor.constants';
import {EditorCommand, EditorHover, EditorLink} from './editor.types';
import {isPositionInRange, isRangeInRange} from './editor.utils';

let EDITOR: monaco.editor.IStandaloneCodeEditor | undefined;
let editorHovers: EditorHover[] = [];
let editorLinks: EditorLink[] = [];
let editorCommands: EditorCommand[] = [];
let editorDecorations: monaco.editor.IModelDeltaDecoration[] = [];
let editorDecorationsCollection: monaco.editor.IEditorDecorationsCollection | undefined;
let nextSelection: monaco.IRange | undefined;
let isRecreatingModel = false;

const modelContentChangeListeners: ((e: monaco.editor.IModelContentChangedEvent) => any)[] = [];

export const mountEditor = (domElement: HTMLElement) => {
  if (EDITOR) {
    log.warn('Editor already mounted!');
    return;
  }
  EDITOR = monaco.editor.create(domElement, MONACO_EDITOR_INITIAL_CONFIG);
  EDITOR.onDidChangeModelContent(e => {
    modelContentChangeListeners.forEach(listener => listener(e));
  });
  EDITOR.onDidChangeCursorPosition(() => {
    if (!isRecreatingModel) {
      consumeNextSelection();
    }
  });
};

export const unmountEditor = () => {
  EDITOR?.dispose();
  EDITOR = undefined;
};

export const resetEditor = () => {
  clearEditorHovers();
  clearEditorLinks();
  clearEditorCommands();
  clearEditorDecorations();
};

const consumeNextSelection = () => {
  if (!nextSelection) {
    return;
  }
  const copy = structuredClone(nextSelection);
  nextSelection = undefined;
  return copy;
};

export const setEditorNextSelection = (range: monaco.IRange) => {
  nextSelection = range;
};

export function recreateEditorModel(editor: monaco.editor.ICodeEditor, text: string, language: string = 'yaml') {
  isRecreatingModel = true;
  resetEditor();
  editor.getModel()?.dispose();
  editor.setModel(monaco.editor.createModel(text, language));
  const selection = consumeNextSelection();
  if (selection) {
    setEditorSelection(selection);
  }
  isRecreatingModel = false;
}

export const getEditor = () => EDITOR;

export const addEditorHover = (hover: EditorHover) => {
  editorHovers.push(hover);
  return hover;
};

export const clearEditorHovers = () => {
  editorHovers = [];
};

export const addEditorLink = (link: EditorLink) => {
  editorLinks.push(link);
  return link;
};

export const clearEditorLinks = () => {
  editorLinks = [];
};

export const addEditorCommand = (payload: EditorCommand['payload']) => {
  const {text, altText, handler, beforeText, afterText} = payload;

  const id = `cmd_${uuidv4()}`;
  const disposable: monaco.IDisposable = monaco.editor.registerCommand(id, handler);
  const markdownLink = {
    isTrusted: true,
    value: `${beforeText || ''}[${text}](command:${id} '${altText}')${afterText || ''}`,
  };

  const command: EditorCommand = {
    id,
    markdownLink,
    disposable,
    payload,
  };

  editorCommands.push(command);
  return command;
};

export const clearEditorCommands = () => {
  editorCommands.forEach(command => command.disposable.dispose());
  editorCommands = [];
};

export const addEditorDecorations = (decorations: monaco.editor.IModelDeltaDecoration[]) => {
  editorDecorations.push(...decorations);
  editorDecorationsCollection?.clear();
  editorDecorationsCollection = EDITOR?.createDecorationsCollection(editorDecorations);
};

export const setEditorSelection = (selectionRange: monaco.IRange) => {
  EDITOR?.setSelection(selectionRange);
  EDITOR?.revealLineInCenter(selectionRange.startLineNumber);
};

export const clearEditorDecorations = () => {
  editorDecorations = [];
  editorDecorationsCollection?.clear();
  editorDecorationsCollection = undefined;
};

monaco.languages.registerHoverProvider('yaml', {
  provideHover: (model, position) => {
    const positionHovers = editorHovers.filter(hover => isPositionInRange(position, hover.range));
    if (positionHovers.length === 0) {
      return null;
    }
    if (positionHovers.length === 1) {
      return positionHovers[0];
    }
    return {
      contents: positionHovers.map(hover => hover.contents).flat(),
    };
  },
});

monaco.languages.registerLinkProvider('yaml', {
  provideLinks: () => {
    return {
      links: editorLinks.map(link => ({
        range: link.range,
        tooltip: link.tooltip,
      })),
    };
  },
  resolveLink: async link => {
    const linksToResolve = editorLinks.filter(({range}) => isRangeInRange(range, link.range));
    const promises = linksToResolve.map(({handler}) => Promise.resolve(handler()));
    await Promise.all(promises);
    return {range: link.range};
  },
});

export const subscribeToEditorModelContentChanges = (listener: (e: monaco.editor.IModelContentChangedEvent) => any) => {
  modelContentChangeListeners.push(listener);
  EDITOR?.onDidChangeModelContent(listener);
};
