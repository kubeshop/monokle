import {SliceCaseReducers, ValidateSliceCaseReducers} from '@reduxjs/toolkit';

import {RootState} from '@shared/models';

export function createSliceReducers<SliceName extends keyof RootState>(
  sliceName: SliceName,
  reducers: ValidateSliceCaseReducers<RootState[SliceName], SliceCaseReducers<RootState[SliceName]>>
) {
  return reducers;
}
