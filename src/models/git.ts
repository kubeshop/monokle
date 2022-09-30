export type GitBranch = {
  name: string;
  commitSha: string;
  type: 'local' | 'remote';
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

export type GitChangedFile = {
  modifiedContent: string;
  name: string;
  originalContent: string;
  gitPath: string; // relative git path
  fullGitPath: string; // full git path
  path: string; // filemap path
  displayPath: string; // path displayed inside changed list
  status: 'staged' | 'unstaged';
  type: 'added' | 'deleted' | 'modified' | 'untracked';
};

export type GitSliceState = {
  changedFiles: GitChangedFile[];
  selectedItem?: GitChangedFile;
  repo?: GitRepo;
};
