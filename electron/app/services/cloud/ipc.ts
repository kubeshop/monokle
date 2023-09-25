import {handleIpc} from '../../utils/ipc';
import {cloudLogin, cloudLogout} from './login';
import {getPolicy} from './policy';
import {getProjectInfo} from './project';
import {getSerializedUser} from './user';

handleIpc('cloud:login', cloudLogin);
handleIpc('cloud:logout', cloudLogout);
handleIpc('cloud:getUser', getSerializedUser);
handleIpc('cloud:getPolicy', getPolicy);
handleIpc('cloud:getProjectInfo', getProjectInfo);
