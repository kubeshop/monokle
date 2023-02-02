import {useCallback, useMemo} from 'react';

import {Button, Dropdown} from 'antd';

import {DownOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {startPreview} from '@redux/services/preview';

import {SavedCommand} from '@shared/models/config';
import {Colors} from '@shared/styles/colors';

import CommandLabel from './CommandLabel';

const PreviewSavedCommand = () => {
  const dispatch = useAppDispatch();
  const preview = useAppSelector(state => state.main.preview);
  const savedCommandMap = useAppSelector(state => state.config.projectConfig?.savedCommandMap || {});

  const onPreviewCommand = useCallback(
    (command: SavedCommand) => {
      startPreview({type: 'command', commandId: command.id}, dispatch);
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
      label: (
        <CommandLabel command={command} isPreviewed={preview?.type === 'command' && preview.commandId === command.id} />
      ),
      onClick: () => onPreviewCommand(command),
    }));
  }, [preview, savedCommandMap, onPreviewCommand]);

  return (
    <Dropdown menu={{items: menuItems}} trigger={['click']} placement="bottom">
      <Button type="link" style={{color: preview?.type === 'command' ? Colors.purple8 : undefined}}>
        Preview saved command
        <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export default PreviewSavedCommand;
