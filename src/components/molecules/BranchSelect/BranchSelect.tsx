import {useCallback, useState} from 'react';

import {Modal} from 'antd';

import {BranchesOutlined} from '@ant-design/icons';

import {GIT_ERROR_MODAL_DESCRIPTION} from '@constants/constants';

import {GitBranch} from '@models/git';

import {setCurrentBranch} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {rootFolderSelector} from '@redux/selectors';

import {TableSelect} from '@atoms';

import {promiseFromIpcRenderer} from '@utils/promises';
import {addDefaultCommandTerminal} from '@utils/terminal';

import BranchTable from './BranchTable';

function BranchSelect() {
  const dispatch = useAppDispatch();

  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const currentBranch = useAppSelector(state => state.git.repo?.currentBranch);
  const defaultShell = useAppSelector(state => state.terminal.settings.defaultShell);
  const rootFolderPath = useAppSelector(rootFolderSelector);
  const terminalsMap = useAppSelector(state => state.terminal.terminalsMap);

  const [visible, setVisible] = useState(false);

  const handleTableToggle = useCallback(
    (newVisible: boolean) => {
      setVisible(newVisible);
    },
    [setVisible]
  );

  const handleSelect = useCallback(
    (branch: GitBranch) => {
      const branchName = branch.type === 'local' ? branch.name : branch.name.replace('origin/', '');

      promiseFromIpcRenderer('git.checkoutGitBranch', 'git.checkoutGitBranch.result', {
        localPath: rootFolderPath,
        branchName,
      }).then(result => {
        if (result.error) {
          Modal.warning({
            title: 'Checkout failed',
            content: <div>{GIT_ERROR_MODAL_DESCRIPTION}</div>,
            zIndex: 100000,
            onCancel: () => {
              addDefaultCommandTerminal(
                terminalsMap,
                `git checkout ${branchName}`,
                defaultShell,
                bottomSelection,
                dispatch
              );
            },
            onOk: () => {
              addDefaultCommandTerminal(
                terminalsMap,
                `git checkout ${branchName}`,
                defaultShell,
                bottomSelection,
                dispatch
              );
            },
          });
        } else {
          dispatch(setCurrentBranch(branchName));
          setVisible(false);
        }
      });
    },
    [rootFolderPath, terminalsMap, bottomSelection, dispatch, defaultShell]
  );

  return (
    <TableSelect
      value={currentBranch || 'default'}
      icon={<BranchesOutlined />}
      table={<BranchTable onSelect={handleSelect} />}
      tablePlacement="bottomLeft"
      tableVisible={visible}
      onTableToggle={handleTableToggle}
    />
  );
}

export default BranchSelect;
