import {handleIpc} from '../../utils/ipc';
import {
  checkoutGitBranch,
  cloneGitRepo,
  fetchRepo,
  getAheadBehindCommitsCount,
  getBranchCommits,
  getGitRemotePath,
  isFolderGitRepo,
  isGitInstalled,
  pullChanges,
  pushChanges,
  stageChangedFiles,
  unstageFiles,
} from './handlers';

handleIpc('git:checkoutGitBranch', checkoutGitBranch);
handleIpc('git:cloneGitRepo', cloneGitRepo);
handleIpc('git:fetchRepo', fetchRepo);
handleIpc('git:getAheadBehindCommitsCount', getAheadBehindCommitsCount);
handleIpc('git:getBranchCommits', getBranchCommits);
handleIpc('git:getGitRemotePath', getGitRemotePath);
handleIpc('git:isFolderGitRepo', isFolderGitRepo);
handleIpc('git:isGitInstalled', isGitInstalled);
handleIpc('git:pullChanges', pullChanges);
handleIpc('git:pushChanges', pushChanges);
handleIpc('git:stageChangedFiles', stageChangedFiles);
handleIpc('git:unstageFiles', unstageFiles);
