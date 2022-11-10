import {useCallback, useMemo} from 'react';

import {Button, Dropdown, Menu} from 'antd';

import {DownOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {startPreview} from '@redux/services/preview';

import Colors from '@styles/Colors';

import {SavedCommand} from '@monokle-desktop/shared';

import CommandLabel from './CommandLabel';

const PreviewSavedCommand = () => {
  const dispatch = useAppDispatch();
  const isCommandPreview = useAppSelector(state => state.main.previewType === 'command');
  const previewCommandId = useAppSelector(state => state.main.previewCommandId);
  const savedCommandMap = useAppSelector(state => state.config.projectConfig?.savedCommandMap || {});

  const onPreviewCommand = useCallback(
    (command: SavedCommand) => {
      startPreview(command.id, 'command', dispatch);
    },
    [dispatch]
  );

  const menuItems = useMemo(() => {
    const savedCommands = Object.values(savedCommandMap).filter((command): command is SavedCommand => Boolean(command));
    if (!savedCommands.length) {
      return [
        {
          key: 'no-commands',
          label: 'No commands saved yet',
          disabled: true,
        },
      ];
    }
    return savedCommands.map(command => ({
      key: command.id,
      label: <CommandLabel command={command} isPreviewed={previewCommandId === command.id} />,
      onClick: () => onPreviewCommand(command),
    }));
  }, [previewCommandId, savedCommandMap, onPreviewCommand]);

  return (
    <Dropdown overlay={<Menu items={menuItems} />} trigger={['click']} placement="bottom">
      <Button type="link" style={{color: isCommandPreview ? Colors.purple8 : undefined}}>
        Preview saved command
        <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export default PreviewSavedCommand;
