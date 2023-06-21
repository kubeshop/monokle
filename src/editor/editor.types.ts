import * as monaco from 'monaco-editor';

export type EditorHover = {
  range: monaco.IRange;
  contents: monaco.IMarkdownString[];
};

export type EditorLink = {
  range: monaco.IRange;
  tooltip?: string;
  handler: () => Promise<void> | void;
};

export type EditorCommand = {
  payload: {
    /**
     * The type of the command is only used for telemetry.
     */
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
