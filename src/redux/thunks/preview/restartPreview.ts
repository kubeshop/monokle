import {createAsyncThunk} from '@reduxjs/toolkit';

import {AnyPreview} from '@shared/models/preview';
import {trackEvent} from '@shared/utils/telemetry';

import {startPreview} from './startPreview';

export const restartPreview = createAsyncThunk<void, AnyPreview, {dispatch: any}>(
  'main/restartPreview',
  async (preview, thunkAPI) => {
    trackEvent('preview/restart', {type: preview.type});

    // delegate to the startPreview method - which does all the same stuff
    thunkAPI.dispatch(startPreview(preview));
  }
);
