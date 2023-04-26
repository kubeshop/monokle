import {createSlice} from '@reduxjs/toolkit';

export const editorSlice = createSlice({
  name: 'editor',
  initialState: {},
  reducers: {
    // this action is dispatched by the editor component when it mounts
    // then, it's used by the editor redux listener to rehydrate the editor state based on the current selection
    editorMounted: () => {},
  },
});

export const {editorMounted} = editorSlice.actions;
