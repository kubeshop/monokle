import {createAsyncThunk} from '@reduxjs/toolkit';

import log from 'loglevel';
import invariant from 'tiny-invariant';

import {ERROR_MSG_FALLBACK} from '@constants/constants';

import {AlertType} from '@models/alert';
import {ThunkApi} from '@models/thunk';

import {setAlert} from '@redux/reducers/alert';
import {doTransferResource} from '@redux/services/compare/transferResource';

import {errorAlert, successAlert} from '@utils/alert';

import {CompareSide, MatchingResourceComparison, TransferDirection} from './state';

type TransferResourceArgs = {
  ids: string[];
  direction: TransferDirection;
};

export const transferResource = createAsyncThunk<
  {side: CompareSide; delta: MatchingResourceComparison[]; from: string; to: string},
  TransferResourceArgs,
  ThunkApi
>('compare/transfer', async ({ids, direction}, {getState, dispatch}) => {
  try {
    const delta: MatchingResourceComparison[] = [];
    const failures: string[] = [];

    const namespace = getState().compare.current.view.namespace;
    const leftSet = getState().compare.current.view.leftSet;
    const rightSet = getState().compare.current.view.rightSet;
    invariant(leftSet && rightSet, 'invalid state');
    const context =
      direction === 'left-to-right'
        ? rightSet.type === 'cluster'
          ? rightSet.context
          : undefined
        : leftSet.type === 'cluster'
        ? leftSet.context
        : undefined;

    const from = direction === 'left-to-right' ? leftSet.type : rightSet.type;
    const to = direction === 'left-to-right' ? rightSet.type : leftSet.type;

    const comparisons = getState().compare.current.comparison?.comparisons.filter(c => ids.includes(c.id)) ?? [];

    // eslint-disable-next-line no-restricted-syntax
    for (const comparison of comparisons) {
      try {
        const source = direction === 'left-to-right' ? comparison.left : comparison.right;
        const target = direction === 'left-to-right' ? comparison.right : comparison.left;
        invariant(source, 'invalid state');

        const options = {from, to, context, namespace};
        // Note: Need to apply one-by-one as it fails in bulk.
        // eslint-disable-next-line no-await-in-loop
        const newTarget = await doTransferResource(source, target, options, getState(), dispatch);

        delta.push({
          ...comparison,
          left: direction === 'left-to-right' ? source : newTarget,
          right: direction === 'left-to-right' ? newTarget : source,
          isMatch: true,
          isDifferent: source.text !== newTarget.text,
        });
      } catch (err) {
        failures.push(comparison.id);
        log.debug('transfer resource failed - ', err);
      }
    }

    const alert = createTransferAlert(ids, failures, to === 'cluster');
    dispatch(setAlert(alert));

    return {side: direction === 'left-to-right' ? 'right' : 'left', delta, from, to};
  } catch (err) {
    log.debug('Transfer failed unexpectedly', err);
    dispatch(setAlert(errorAlert(ERROR_MSG_FALLBACK)));
    throw err;
  }
});

function createTransferAlert(total: string[], failures: string[], toCluster: boolean): AlertType {
  const totalCount = total.length;
  const errorCount = failures.length;
  const success = errorCount === 0;

  if (!success) {
    const verb = toCluster ? 'deploy' : 'extract';
    const title = `Cannot ${verb} resources`;
    const message =
      totalCount === errorCount
        ? `Looks like all resources failed to ${verb}. Please try again later.`
        : `Looks like ${errorCount} of the ${totalCount} resources failed to ${verb}. Please try again later.`;
    return errorAlert(title, message);
  }

  const verb = toCluster ? 'Applied' : 'Extracted';
  const title = `${verb} ${totalCount} resources`;
  return successAlert(title);
}
