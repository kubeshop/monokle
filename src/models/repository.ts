import * as Rt from 'runtypes';

export const GitRepositoryRuntype = Rt.Record({
  owner: Rt.String,
  name: Rt.String,
  branch: Rt.String,
});

export const isGitRepository = GitRepositoryRuntype.guard;
export const validateGitRepository = GitRepositoryRuntype.check;
