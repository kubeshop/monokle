import {handleIpc} from '../../utils/ipc';
import {ping} from './handlers/ping';

handleIpc('cluster:ping', ping);
