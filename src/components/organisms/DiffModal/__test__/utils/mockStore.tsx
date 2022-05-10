import React, {ReactNode} from 'react';
import {Provider} from 'react-redux';

import {configureStore, createSlice} from '@reduxjs/toolkit';

import {v4 as uuid} from 'uuid';

import {FakeMainState} from '../../DiffState';

type Props = {
  mainState: Partial<FakeMainState>;
  children: ReactNode;
};

const slice = createSlice({
  name: 'main',
  initialState: {} as FakeMainState,
  reducers: {
    deviceIdUpdated: state => {
      state.deviceId = uuid();
    },
  },
});

export const {deviceIdUpdated} = slice.actions;

export const Mockstore = ({mainState, children}: Props) => {
  return (
    <Provider
      store={configureStore({
        reducer: {
          main: createSlice({
            name: 'main',
            initialState: mainState as FakeMainState,
            reducers: {
              deviceIdUpdated: state => {
                state.deviceId = uuid();
              },
            },
          }).reducer,
        },
      })}
    >
      {children}
    </Provider>
  );
};
