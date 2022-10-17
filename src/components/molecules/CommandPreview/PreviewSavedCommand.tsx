import {useCallback, useMemo} from 'react';

import {Button, Dropdown, Menu} from 'antd';

import {ArrowDownOutlined} from '@ant-design/icons';

import {SavedCommand} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {startPreview} from '@redux/services/preview';

import Colors from '@styles/Colors';

const PreviewSavedCommand = () => {
  const dispatch = useAppDispatch();
  const isCommandPreview = useAppSelector(state => state.main.previewType === 'command');
  const previewCommandId = useAppSelector(state => state.main.previewResourceId);
  const savedCommandMap = useAppSelector(state => state.config.projectConfig?.savedCommandMap || {});

  const onPreviewCommand = useCallback(
    (command: SavedCommand) => {
      startPreview(command.id, 'command', dispatch);
    },
    [dispatch]
  );

  const menuItems = useMemo(() => {
    const savedCommands = Object.values(savedCommandMap);
    if (!savedCommands.length) {
      return [
        {
          key: 'no-commands',
          label: 'No commands saved yet',
          disabled: true,
        },
      ];
    }
    return Object.values(savedCommandMap).map(command => ({
      key: command.id,
      label:
        previewCommandId === command.id ? (
          <span style={{color: Colors.lightSeaGreen}}>{command.label}</span>
        ) : (
          command.label
        ),
      onClick: () => onPreviewCommand(command),
    }));
  }, [previewCommandId, savedCommandMap, onPreviewCommand]);

  return (
    <Dropdown overlay={<Menu items={menuItems} />} trigger={['click']} placement="bottom">
      <Button type="link" icon={<ArrowDownOutlined />} color={isCommandPreview ? Colors.lightSeaGreen : undefined}>
        Preview saved command
      </Button>
    </Dropdown>
  );
};

export default PreviewSavedCommand;
