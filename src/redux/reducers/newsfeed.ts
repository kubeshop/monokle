import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import initialState from '@redux/initialState';

import {NewsFeedItem, NewsFeedState} from '@shared/models/newsfeed';

export const newsfeedSlice = createSlice({
  name: 'newsfeed',
  initialState: initialState.newsfeed,
  reducers: {
    setNewsFeed: (state: Draft<NewsFeedState>, action: PayloadAction<NewsFeedItem[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addMatcher(
      () => true,
      (state, action) => {
        if (action.payload?.newsfeed) {
          state.items = action.payload.newsfeed.items;
        }
      }
    );
  },
});

export const {setNewsFeed} = newsfeedSlice.actions;
export default newsfeedSlice.reducer;
