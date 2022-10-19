export type GitBranchCommit = {
  author_email: string;
  author_name: string;
  body: string;
  date: string;
  hash: string;
  message: string;
  refs: string;
};

export type GitBranch = {
  name: string;
  commitSha: string;
  type: 'local' | 'remote';
  commits?: GitBranchCommit[];
};

export type GitRepo = {
  currentBranch: string;
  branches: string[];
  branchMap: Record<string, GitBranch>;
  commits: {
    ahead: number; // number of commits on local but not on remote ( push )
    behind: number; // number of commits on remote but not on local ( pull )
  };
  hasRemoteRepo: boolean;
};

export type GitChangedFileType = 'added' | 'deleted' | 'modified' | 'untracked' | 'renamed' | 'conflict' | 'submodule';

export type GitChangedFile = {
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

export type GitSliceState = {
  changedFiles: GitChangedFile[];
  gitCloneModal: {
    open: boolean;
  };
  isGitInstalled: boolean;
  loading: boolean;
  selectedItem?: GitChangedFile;
  repo?: GitRepo;
};
