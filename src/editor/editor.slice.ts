import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import * as monaco from 'monaco-editor';

import {setEditorNextSelection, setEditorSelection} from './editor.instance';

export const editorSlice = createSlice({
  name: 'editor',
  initialState: {},
  reducers: {
    // this action is dispatched by the editor component when it mounts
    // then, it's used by the editor redux listener to rehydrate the editor state based on the current selection
    editorMounted: () => {},
    editorUnmounted: () => {},
    editorSetSelection: (_, action: PayloadAction<{range: monaco.IRange}>) => {
      setEditorSelection(action.payload.range);
    },
    editorSetNextSelection: (_, action: PayloadAction<{range: monaco.IRange}>) => {
      setEditorNextSelection(action.payload.range);
    },
  },
});

export const {editorMounted, editorUnmounted, editorSetSelection, editorSetNextSelection} = editorSlice.actions;
