import {handleIpc} from '../../utils/ipc';
import {cloudLogin, cloudLogout} from './login';
import {getPolicy} from './policy';
import {getUser} from './user';

handleIpc('cloud:login', cloudLogin);
handleIpc('cloud:logout', cloudLogout);
handleIpc('cloud:getUser', getUser);
handleIpc('cloud:getPolicy', getPolicy);
