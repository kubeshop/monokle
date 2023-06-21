import * as monaco from 'monaco-editor';

export type EditorHover = {
  type: string;
  range: monaco.IRange;
  contents: monaco.IMarkdownString[];
};

export type EditorLink = {
  type: string;
  range: monaco.IRange;
  tooltip?: string;
  handler: () => Promise<void> | void;
};

export type EditorCommand = {
  payload: {
    type: string;
    text: string;
    altText: string;
    handler: monaco.editor.ICommandHandler;
    beforeText?: string;
    afterText?: string;
  };
  id: string;
  markdownLink: monaco.IMarkdownString;
  disposable: monaco.IDisposable;
};
