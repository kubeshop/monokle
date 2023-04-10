import {handleIpc} from '../../utils/ipc';
import {cloneGitRepo, getGitRemotePath, isFolderGitRepo, isGitInstalled} from './handlers';

handleIpc('git:cloneGitRepo', cloneGitRepo);
handleIpc('git:getGitRemotePath', getGitRemotePath);
handleIpc('git:isFolderGitRepo', isFolderGitRepo);
handleIpc('git:isGitInstalled', isGitInstalled);
