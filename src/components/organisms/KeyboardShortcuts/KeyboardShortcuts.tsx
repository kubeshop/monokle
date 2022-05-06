import {Button, Modal, Typography} from 'antd';

import hotkeys from '@constants/hotkeys';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeKeyboardShortcutsModal} from '@redux/reducers/ui';

import {defineHotkey} from '@utils/defineHotkey';

import Keyboard from '@assets/Keyboard.svg';

import BoardKeys from './BoardKeys';

import * as S from './styled';

const {Text} = Typography;

const shortcutsNavigation = [
  {name: 'Navigate Back', value: defineHotkey(hotkeys.SELECT_FROM_HISTORY_BACK)},
  {name: 'Navigate Forward', value: defineHotkey(hotkeys.SELECT_FROM_HISTORY_FORWARD)},
  {name: 'Preview Cluster', value: defineHotkey(hotkeys.PREVIEW_CLUSTER)},
  {name: 'Exit Preview', value: defineHotkey(hotkeys.EXIT_PREVIEW_MODE)},
  {name: 'Toggle Settings', value: defineHotkey(hotkeys.TOGGLE_SETTINGS)},
  {name: 'Toggle Left Pane', value: defineHotkey(hotkeys.TOGGLE_LEFT_PANE)},
  {name: 'Toggle Right Pane', value: defineHotkey(hotkeys.TOGGLE_RIGHT_PANE)},
  {name: 'Open New Resource Wizard', value: defineHotkey(hotkeys.OPEN_NEW_RESOURCE_WIZARD)},
  {name: 'Open Explorer Tab', value: defineHotkey(hotkeys.OPEN_EXPLORER_TAB)},
  {name: 'Open Kustomization Tab', value: defineHotkey(hotkeys.OPEN_KUSTOMIZATION_TAB)},
  {name: 'Open Helm Tab', value: defineHotkey(hotkeys.OPEN_HELM_TAB)},
  {name: 'Open Validation Tab', value: defineHotkey(hotkeys.OPEN_VALIDATION_TAB)},
  {name: 'Open Quick Search', value: defineHotkey(hotkeys.OPEN_QUICK_SEARCH)},
  {name: 'Open Getting Started Page', value: defineHotkey(hotkeys.OPEN_GETTING_STARTED_PAGE)},
  {name: 'Open New Window', value: defineHotkey(hotkeys.OPEN_NEW_WINDOW)},
];

const shortcutsTools = [
  {name: 'Save (in editors)', value: defineHotkey(hotkeys.SAVE)},
  {name: 'Select Folder', value: defineHotkey(hotkeys.SELECT_FOLDER)},
  {name: 'Refresh Folder', value: defineHotkey(hotkeys.REFRESH_FOLDER)},
  {name: 'Zoom In', value: defineHotkey(hotkeys.ZOOM_IN)},
  {name: 'Zoom Out', value: defineHotkey(hotkeys.ZOOM_OUT)},
  {name: 'Create New Resource', value: defineHotkey(hotkeys.CREATE_NEW_RESOURCE)},
  {name: 'Apply Selection', value: defineHotkey(hotkeys.APPLY_SELECTION)},
  {name: 'Diff Resource', value: defineHotkey(hotkeys.DIFF_RESOURCE)},
  {name: 'Reset Resource Filters', value: defineHotkey(hotkeys.RESET_RESOURCE_FILTERS)},
];

const KeyboardShortcuts = () => {
  const dispatch = useAppDispatch();
  const isKeyboardShortcutsVisible = useAppSelector(state => state.ui.isKeyboardShortcutsModalOpen);

  const handleClose = () => {
    dispatch(closeKeyboardShortcutsModal());
  };

  return (
    <Modal
      visible={isKeyboardShortcutsVisible}
      centered
      width={900}
      onCancel={handleClose}
      title="Keyboard shortcuts"
      footer={
        <Button
          style={{zIndex: 100, marginBottom: 24, marginRight: 24, display: 'inline-block'}}
          type="primary"
          onClick={handleClose}
        >
          Got it!
        </Button>
      }
    >
      <div id="KeyboardShortcuts">
        <S.HeightFillDiv />
        <S.ContentContainerDiv>
          <img src={Keyboard} />
          <S.StyledContainer>
            <S.StyledTextBlock>
              <thead>
                <tr>
                  <th>
                    <Text strong style={{fontSize: '16px'}}>
                      Navigation
                    </Text>
                  </th>
                </tr>
              </thead>
              <tbody>
                {shortcutsNavigation.map(shortcut => (
                  <tr key={shortcut.name}>
                    <td>
                      <Text>{shortcut.name}</Text>
                    </td>
                    <td>
                      <BoardKeys bindings={shortcut.value} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </S.StyledTextBlock>
            <S.StyledTextBlock>
              <thead>
                <tr>
                  <th>
                    <Text strong style={{fontSize: '16px'}}>
                      Tools
                    </Text>
                  </th>
                </tr>
              </thead>
              <tbody>
                {shortcutsTools.map(shortcut => (
                  <tr key={shortcut.name}>
                    <td>
                      <Text>{shortcut.name}</Text>
                    </td>
                    <td>
                      <BoardKeys bindings={shortcut.value} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </S.StyledTextBlock>
          </S.StyledContainer>
        </S.ContentContainerDiv>
      </div>
    </Modal>
  );
};

export default KeyboardShortcuts;
