import {Modal, Typography} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeKeyboardShortcutsModal} from '@redux/reducers/ui';

import Keyboard from '@assets/Keyboard.svg';

import {hotkeys} from '@shared/constants/hotkeys';
import {defineHotkey} from '@shared/utils/hotkey';

import BoardKeys from './BoardKeys';
import * as S from './KeyboardShortcuts.styled';

const {Text} = Typography;

const shortcutsNavigation = Object.values(hotkeys)
  .filter(hotkey => {
    return hotkey.category === 'navigation';
  })
  .map(hotkey => {
    return {name: hotkey.name, value: defineHotkey(hotkey.key)};
  });

const shortcutsTools = Object.values(hotkeys)
  .filter(hotkey => {
    return hotkey.category === 'tool';
  })
  .map(hotkey => {
    return {name: hotkey.name, value: defineHotkey(hotkey.key).trim()};
  });

const KeyboardShortcuts = () => {
  const dispatch = useAppDispatch();
  const isKeyboardShortcutsVisible = useAppSelector(state => state.ui.isKeyboardShortcutsModalOpen);

  const handleClose = () => {
    dispatch(closeKeyboardShortcutsModal());
  };

  return (
    <Modal
      open={isKeyboardShortcutsVisible}
      centered
      width={900}
      onCancel={handleClose}
      title="Keyboard shortcuts"
      footer={
        <S.Button type="primary" onClick={handleClose}>
          Got it!
        </S.Button>
      }
    >
      <div id="KeyboardShortcuts">
        <S.HeightFill />

        <S.ContentContainer>
          <img src={Keyboard} />

          <S.Container>
            <S.TextBlock>
              <thead>
                <tr>
                  <th>
                    <S.TextHeader strong>Navigation</S.TextHeader>
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
            </S.TextBlock>

            <S.TextBlock>
              <thead>
                <tr>
                  <th>
                    <S.TextHeader strong>Tools</S.TextHeader>
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
            </S.TextBlock>
          </S.Container>
        </S.ContentContainer>
      </div>
    </Modal>
  );
};

export default KeyboardShortcuts;
