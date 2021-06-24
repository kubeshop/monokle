import {setLogs} from '@redux/reducers/logs';
import {AppDispatch} from '@redux/store';

export function logMessage(msg: string, dispatch: AppDispatch) {
  dispatch(setLogs([msg]));
}
