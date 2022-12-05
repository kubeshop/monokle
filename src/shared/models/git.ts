type GitBranchCommit = {
  author_email: string;
  author_name: string;
  body: string;
  date: string;
  hash: string;
  message: string;
  refs: string;
};

type GitBranch = {
  name: string;
  commitSha: string;
  type: 'local' | 'remote';
  commits?: GitBranchCommit[];
};

type GitRemoteRepo = {
  authRequired: boolean;
  exists: boolean;
  errorMessage?: string;
};

type GitRepo = {
  currentBranch: string;
  branches: string[];
  branchMap: Record<string, GitBranch>;
  commits: {
    ahead: number; // number of commits on local but not on remote ( push )
    behind: number; // number of commits on remote but not on local ( pull )
  };
  remoteRepo: GitRemoteRepo;
  remoteUrl?: string;
};

type GitChangedFileType = 'added' | 'deleted' | 'modified' | 'untracked' | 'renamed' | 'conflict' | 'submodule';

type GitChangedFile = {
  modifiedContent: string;
  name: string;
  originalContent: string;
  gitPath: string; // relative git path
  fullGitPath: string; // full git path
  path: string; // filemap path
  displayPath: string; // path displayed inside changed list
  status: 'staged' | 'unstaged';
  type: GitChangedFileType;
};

type GitSliceState = {
  changedFiles: GitChangedFile[];
  gitCloneModal: {
    open: boolean;
  };
  isGitInstalled: boolean;
  loading: boolean;
  selectedItem?: GitChangedFile;
  repo?: GitRepo;
};

export type {GitBranch, GitBranchCommit, GitChangedFile, GitChangedFileType, GitRemoteRepo, GitRepo, GitSliceState};
