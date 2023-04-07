import {handleIpc} from '../../utils/ipc';
import {isGitInstalled} from './handlers';

handleIpc('git:isGitInstalled', isGitInstalled);
