import {handleIpc} from '../../utils/ipc';
import {
  checkoutGitBranch,
  cloneGitRepo,
  getAheadBehindCommitsCount,
  getBranchCommits,
  getGitRemotePath,
  isFolderGitRepo,
  isGitInstalled,
  pullChanges,
  pushChanges,
} from './handlers';

handleIpc('git:checkoutGitBranch', checkoutGitBranch);
handleIpc('git:cloneGitRepo', cloneGitRepo);
handleIpc('git:getAheadBehindCommitsCount', getAheadBehindCommitsCount);
handleIpc('git:getBranchCommits', getBranchCommits);
handleIpc('git:getGitRemotePath', getGitRemotePath);
handleIpc('git:isFolderGitRepo', isFolderGitRepo);
handleIpc('git:isGitInstalled', isGitInstalled);
handleIpc('git:pullChanges', pullChanges);
handleIpc('git:pushChanges', pushChanges);
