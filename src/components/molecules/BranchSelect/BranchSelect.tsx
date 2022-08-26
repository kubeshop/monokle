import {useCallback, useState} from 'react';

import {BranchesOutlined} from '@ant-design/icons';

import {useAppSelector} from '@redux/hooks';

import {TableSelect} from '@components/atoms';

import BranchTable from './BranchTable';

function BranchSelect() {
  const [visible, setVisible] = useState(false);

  const currentBranch = useAppSelector(state => state.git.repo?.currentBranch);

  const localBranches = useAppSelector(state =>
    Object.values(state.git.repo?.branchMap || {}).filter(b => !b.name.startsWith('remotes'))
  );

  const handleTableToggle = useCallback(
    (newVisible: boolean) => {
      setVisible(newVisible);
    },
    [setVisible]
  );

  const handleSelect = () => {};
  // const handleTableToggle = () => {};

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
      value={currentBranch || 'default'}
      icon={<BranchesOutlined />}
      table={<BranchTable onSelect={handleSelect} branches={localBranches} branchCount={localBranches.length} />}
      tablePlacement="bottomLeft"
      tableVisible={visible}
      onTableToggle={handleTableToggle}
    />
  );
}

export default BranchSelect;
