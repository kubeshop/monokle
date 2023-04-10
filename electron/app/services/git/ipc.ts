import {handleIpc} from '../../utils/ipc';
import {
  checkoutGitBranch,
  cloneGitRepo,
  getGitRemotePath,
  isFolderGitRepo,
  isGitInstalled,
  pullChanges,
} from './handlers';

handleIpc('git:checkoutGitBranch', checkoutGitBranch);
handleIpc('git:cloneGitRepo', cloneGitRepo);
handleIpc('git:getGitRemotePath', getGitRemotePath);
handleIpc('git:isFolderGitRepo', isFolderGitRepo);
handleIpc('git:isGitInstalled', isGitInstalled);
handleIpc('git:pullChanges', pullChanges);
