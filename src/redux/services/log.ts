import {AppDispatch} from '@models/appdispatch';

import {setLogs} from '@redux/reducers/logs';

/**
 * Utility method to log a message to the log view
 */

export function logMessage(msg: string, dispatch: AppDispatch) {
  dispatch(setLogs([msg]));
}
