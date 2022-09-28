import {useCallback, useState} from 'react';

import {Modal} from 'antd';

import {BranchesOutlined} from '@ant-design/icons';

import {v4 as uuidv4} from 'uuid';

import {GitBranch} from '@models/git';

import {setCurrentBranch} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {addTerminal, setSelectedTerminal} from '@redux/reducers/terminal';
import {setLeftBottomMenuSelection} from '@redux/reducers/ui';
import {rootFolderSelector} from '@redux/selectors';

import {TableSelect} from '@atoms';

import {promiseFromIpcRenderer} from '@utils/promises';

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
            title: 'Checkout not possible',
            content: <div>Please commit your changes or stash them before you switch branches.</div>,
            zIndex: 100000,
          });

          // check if there is a terminal with same default command
          const foundTerminal = Object.values(terminalsMap).find(
            terminal => terminal.defaultCommand === `git checkout ${branchName}`
          );

          if (foundTerminal) {
            dispatch(setSelectedTerminal(foundTerminal.id));
          } else {
            const newTerminalId = uuidv4();
            dispatch(setSelectedTerminal(newTerminalId));
            dispatch(
              addTerminal({
                id: newTerminalId,
                isRunning: false,
                defaultCommand: `git checkout ${branchName}`,
                shell: defaultShell,
              })
            );
          }

          if (!bottomSelection || bottomSelection !== 'terminal') {
            dispatch(setLeftBottomMenuSelection('terminal'));
          }
        } else {
          dispatch(setCurrentBranch(branch.type === 'local' ? branch.name : branch.name.replace('origin/', '')));
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
