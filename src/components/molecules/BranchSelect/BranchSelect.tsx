import {useCallback, useState} from 'react';

import {BranchesOutlined} from '@ant-design/icons';

import {GitBranch} from '@models/git';

import {setCurrentBranch} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {rootFolderSelector} from '@redux/selectors';

import {TableSelect} from '@components/atoms';

import {promiseFromIpcRenderer} from '@utils/promises';

import BranchTable from './BranchTable';

function BranchSelect() {
  const dispatch = useAppDispatch();

  const [visible, setVisible] = useState(false);

  const currentBranch = useAppSelector(state => state.git.repo?.currentBranch);

  const localBranches = useAppSelector(state =>
    Object.values(state.git.repo?.branchMap || {}).filter(b => !b.name.startsWith('remotes'))
  );

  const rootFolderPath = useAppSelector(rootFolderSelector);

  const handleTableToggle = useCallback(
    (newVisible: boolean) => {
      setVisible(newVisible);
    },
    [setVisible]
  );

  const handleSelect = useCallback(
    ({name}: GitBranch) => {
      promiseFromIpcRenderer('git.checkoutGitBranch', 'git.checkoutGitBranch.result', {
        localPath: rootFolderPath,
        branchName: name,
      }).then(() => {
        dispatch(setCurrentBranch(name));
        setVisible(false);
      });
    },
    [rootFolderPath, dispatch]
  );

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
