import {setLogs} from '@redux/reducers/logs';
import {AppDispatch} from '@redux/store';

/**
 * Utility method to log a message to the log view
 */

export function logMessage(msg: string, dispatch: AppDispatch) {
  dispatch(setLogs([msg]));
}
