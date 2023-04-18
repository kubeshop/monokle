import {ActionReducerMapBuilder, SliceCaseReducers, ValidateSliceCaseReducers} from '@reduxjs/toolkit';

import {RootState} from '@shared/models/rootState';

export function createSliceReducers<
  SliceName extends keyof RootState,
  Reducers extends ValidateSliceCaseReducers<RootState[SliceName], SliceCaseReducers<RootState[SliceName]>>
>(sliceName: SliceName, reducers: Reducers) {
  return reducers;
}

export function createSliceExtraReducers<SliceName extends keyof RootState>(
  sliceName: SliceName,
  buildExtraReducers: (builder: ActionReducerMapBuilder<RootState[SliceName]>) => void
) {
  return (builder: ActionReducerMapBuilder<RootState[SliceName]>) => {
    buildExtraReducers(builder);
  };
}
