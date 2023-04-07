import {handleIpc} from '../../utils/ipc';
import {isFolderGitRepo, isGitInstalled} from './handlers';

handleIpc('git:isFolderGitRepo', isFolderGitRepo);
handleIpc('git:isGitInstalled', isGitInstalled);
