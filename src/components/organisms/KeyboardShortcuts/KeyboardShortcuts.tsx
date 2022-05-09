import {Button, Modal, Typography} from 'antd';

import {entries} from 'lodash';

import hotkeys from '@constants/hotkeys';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeKeyboardShortcutsModal} from '@redux/reducers/ui';

import {defineHotkey} from '@utils/defineHotkey';

import Keyboard from '@assets/Keyboard.svg';

import BoardKeys from './BoardKeys';

import * as S from './styled';

const {Text} = Typography;

const shortcutsNavigation = entries(hotkeys)
  .filter(([_, hotkey]) => {
    return hotkey.category === 'navigation';
  })
  .map(([_, hotkey]) => {
    return {name: hotkey.name, value: defineHotkey(hotkey.key)};
  });

const shortcutsTools = entries(hotkeys)
  .filter(([_, hotkey]) => {
    return hotkey.category === 'tool';
  })
  .map(([_, hotkey]) => {
    return {name: hotkey.name, value: defineHotkey(hotkey.key)};
  });

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
