import {existsSync, promises as fs} from 'fs';
import {SimpleGit, simpleGit} from 'simple-git';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {FileMapType} from '@models/appstate';
import {GitRepo} from '@models/git';

import {formatGitChangedFiles} from '@utils/git';

export async function areFoldersGitRepos(paths: string[]) {
  let foldersStatus: {path: string; isGitRepo: boolean}[] = [];

  for (let i = 0; i <= paths.length - 1; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const isGitRepo = await isFolderGitRepo(paths[i]);

    foldersStatus.push({path: paths[i], isGitRepo});
  }

  return foldersStatus;
}

export async function isFolderGitRepo(path: string) {
  if (!existsSync(path)) {
    return false;
  }
  const git: SimpleGit = simpleGit({baseDir: path});

  try {
    await git.status();
    return true;
  } catch (e) {
    return false;
  }
}

export async function getRemotePath(localPath: string) {
  const git: SimpleGit = simpleGit({baseDir: localPath});

  const gitFolderPath = await git.revparse({'--show-toplevel': null});
  return gitFolderPath;
}

export async function cloneGitRepo(payload: {localPath: string; repoPath: string}) {
  const {localPath, repoPath} = payload;
  try {
    const stat = await fs.stat(localPath);
    if (!stat.isDirectory()) {
      throw new Error(`${localPath} is ot a directory`);
    }
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      fs.mkdir(localPath);
    } else {
      throw e;
    }
  }
  const git: SimpleGit = simpleGit({baseDir: localPath});
  await git.clone(repoPath, localPath);
}

export async function getGitRepoInfo(localPath: string) {
  const git: SimpleGit = simpleGit({baseDir: localPath});

  let gitRepo: GitRepo;

  try {
    const remoteBranchSummary = await git.branch({'-r': null});
    const localBranches = await git.branchLocal();

    gitRepo = {
      branches: [...localBranches.all, ...remoteBranchSummary.all],
      currentBranch: localBranches.current || remoteBranchSummary.current,
      branchMap: {},
      commits: {ahead: 0, behind: 0},
      hasRemoteRepo: false,
    };

    gitRepo.branchMap = Object.fromEntries(
      Object.entries({...localBranches.branches}).map(([key, value]) => [
        key,
        {name: value.name, commitSha: value.commit, type: 'local'},
      ])
    );

    gitRepo.branchMap = {
      ...gitRepo.branchMap,
      ...Object.fromEntries(
        Object.entries({...remoteBranchSummary.branches}).map(([key, value]) => [
          key,
          {name: value.name.replace('remotes/', ''), commitSha: value.commit, type: 'remote'},
        ])
      ),
    };
  } catch (e) {
    return undefined;
  }

  for (let i = 0; i < Object.values(gitRepo.branchMap).length - 1; i += 1) {
    const branchName = Object.values(gitRepo.branchMap)[i].name;

    const commits = [
      // eslint-disable-next-line no-await-in-loop
      ...(await git.log({[`${branchName !== gitRepo.currentBranch ? 'HEAD..' : ''}${branchName}`]: null})).all,
    ];

    Object.values(gitRepo.branchMap)[i].commits = commits;
  }

  try {
    await git.remote(['show', 'origin']);
    gitRepo.hasRemoteRepo = true;
  } catch (e) {
    gitRepo.hasRemoteRepo = false;
  }

  try {
    const [aheadCommits, behindCommits] = (
      await git.raw('rev-list', '--left-right', '--count', `${gitRepo.currentBranch}...origin/${gitRepo.currentBranch}`)
    )
      .trim()
      .split('\t');

    gitRepo.commits.ahead = parseInt(aheadCommits, 10);
    gitRepo.commits.behind = parseInt(behindCommits, 10);
  } catch (e) {
    return gitRepo;
  }

  return gitRepo;
}

export async function checkoutGitBranch(payload: {localPath: string; branchName: string}) {
  const {localPath, branchName} = payload;
  const git: SimpleGit = simpleGit({baseDir: localPath});

  try {
    await git.checkout(branchName);
    return {};
  } catch (e: any) {
    return {error: e.message};
  }
}

export async function initGitRepo(localPath: string) {
  const git: SimpleGit = simpleGit({baseDir: localPath});
  await git.init();
  await git.commit('Initial commit', undefined, {'--allow-empty': null});
}

export async function getChangedFiles(localPath: string, fileMap: FileMapType) {
  const git: SimpleGit = simpleGit({baseDir: localPath});

  const projectFolderPath = fileMap[ROOT_FILE_ENTRY].filePath;
  const gitFolderPath = await git.revparse({'--show-toplevel': null});
  const currentBranch = (await git.branch()).current;

  const branchStatus = await git.status({'-z': null, '-uall': null});
  const files = branchStatus.files;

  const changedFiles = formatGitChangedFiles(files, fileMap, projectFolderPath, gitFolderPath);

  for (let i = 0; i < changedFiles.length; i += 1) {
    let originalContent: string = '';

    try {
      // eslint-disable-next-line no-await-in-loop
      originalContent = await git.show(`${currentBranch}:${changedFiles[i].gitPath}`);
    } catch (error) {
      originalContent = '';
    }

    changedFiles[i].originalContent = originalContent;
  }

  return changedFiles;
}

export async function getCurrentBranch(localPath: string) {
  const git: SimpleGit = simpleGit({baseDir: localPath});
  const branchesSummary = await git.branch();

  return branchesSummary.current;
}

export async function stageChangedFiles(localPath: string, filePaths: string[]) {
  const git: SimpleGit = simpleGit({baseDir: localPath});

  await git.add(filePaths);
}

export async function unstageFiles(localPath: string, filePaths: string[]) {
  const git: SimpleGit = simpleGit({baseDir: localPath});

  const unstageProperties = filePaths.reduce((prev, current) => {
    return {...prev, [current]: null};
  }, {} as any);

  await git.reset({'-q': null, HEAD: null, '--': null, ...unstageProperties});
}

export async function commitChanges(localPath: string, message: string) {
  const git: SimpleGit = simpleGit({baseDir: localPath});
  await git.commit(message);
}

export async function deleteLocalBranch(localPath: string, branchName: string) {
  const git: SimpleGit = simpleGit({baseDir: localPath});
  await git.deleteLocalBranch(branchName);
}

export async function createLocalBranch(localPath: string, branchName: string) {
  const git: SimpleGit = simpleGit({baseDir: localPath});
  await git.checkoutLocalBranch(branchName);
}

export async function publishLocalBranch(localPath: string, branchName: string) {
  const git: SimpleGit = simpleGit({baseDir: localPath});
  await git.push({'-u': null, origin: null, [branchName]: null});
}

export async function pushChanges(localPath: string, branchName: string) {
  const git: SimpleGit = simpleGit({baseDir: localPath});

  try {
    await git.push('origin', branchName);
    return {};
  } catch (e: any) {
    return {error: e.message};
  }
}

export async function setRemote(localPath: string, remoteURL: string) {
  const git: SimpleGit = simpleGit({baseDir: localPath});
  await git.addRemote('origin', remoteURL);
  await git.fetch();
}

export async function getCommitsCount(localPath: string, branchName: string) {
  const git: SimpleGit = simpleGit({baseDir: localPath});

  try {
    const [aheadCommits, behindCommits] = (
      await git.raw('rev-list', '--left-right', '--count', `${branchName}...origin/${branchName}`)
    )
      .trim()
      .split('\t');

    return {aheadCommits, behindCommits};
  } catch (e) {
    return {aheadCommits: 0, behindCommits: 0};
  }
}

export async function fetchRepo(localPath: string) {
  const git: SimpleGit = simpleGit({baseDir: localPath});
  await git.fetch();
}

export async function pullChanges(localPath: string) {
  const git: SimpleGit = simpleGit({baseDir: localPath});

  try {
    await git.pull();
    return {};
  } catch (e: any) {
    return {error: e.message};
  }
}
