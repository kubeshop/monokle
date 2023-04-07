import {handleIpc} from '../../utils/ipc';
import {cloneGitRepo, isFolderGitRepo, isGitInstalled} from './handlers';

handleIpc('git:cloneGitRepo', cloneGitRepo);
handleIpc('git:isFolderGitRepo', isFolderGitRepo);
handleIpc('git:isGitInstalled', isGitInstalled);
