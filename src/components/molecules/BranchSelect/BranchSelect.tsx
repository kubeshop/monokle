import {useState} from 'react';

import {BranchesOutlined} from '@ant-design/icons';

import {GitBranch} from '@models/git';

import {TableSelect} from '@components/atoms';

import BranchTable from './BranchTable';

function BranchSelect() {
  const [visible, setVisible] = useState(false);
  // const {repoWithOwner, owner, repo, ref} = useRepoParams();
  // const [fetchBranches, {data}] = useLazyGetBranchesQuery();

  // const branchCount = data?.getRepository.branches.totalCount ?? 0;
  // const branches = data?.getRepository.branches.nodes ?? [];

  const branches: GitBranch[] = [];
  const branchCount = 1;

  // const handleTableToggle = useCallback(
  //   (newVisible: boolean) => {
  //     // fetchBranches({owner, repo});
  //     setVisible(newVisible);
  //   },
  //   [fetchBranches, setVisible, owner, repo]
  // );

  const handleSelect = () => {};
  const handleTableToggle = () => {};

  // const handleSelect = useCallback(
  //   ({name}: GitBranch) => {
  //     // const url = `/explore/github/${repoWithOwner}/branch/${name}${search}`;
  //     // navigate(url);
  //     setVisible(false);
  //   },
  //   [navigate]
  // );

  return (
    <TableSelect
      value="Default"
      icon={<BranchesOutlined />}
      table={<BranchTable onSelect={handleSelect} branches={branches} branchCount={branchCount} />}
      tablePlacement="bottomLeft"
      tableVisible={visible}
      onTableToggle={handleTableToggle}
    />
  );
}

export default BranchSelect;
