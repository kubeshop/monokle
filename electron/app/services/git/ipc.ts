import {handleIpc} from '../../utils/ipc';
import {checkoutGitBranch, cloneGitRepo, getGitRemotePath, isFolderGitRepo, isGitInstalled} from './handlers';

handleIpc('git:checkoutGitBranch', checkoutGitBranch);
handleIpc('git:cloneGitRepo', cloneGitRepo);
handleIpc('git:getGitRemotePath', getGitRemotePath);
handleIpc('git:isFolderGitRepo', isFolderGitRepo);
handleIpc('git:isGitInstalled', isGitInstalled);
