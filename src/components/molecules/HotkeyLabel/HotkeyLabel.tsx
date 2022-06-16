import hotkeys, {Hotkey} from '@constants/hotkeys';

import {defineHotkey} from '@utils/defineHotkey';

import * as S from './HotkeyLabel.styled';

interface IProps {
  name: Hotkey;
  text: string;
}

const HotkeyLabel: React.FC<IProps> = props => {
  const {name, text} = props;

  const hotkey = hotkeys[name];

  if (!hotkey) {
    return null;
  }

  return (
    <S.HotkeyLabelContainer>
      {text}

      <S.CommandsContainer>
        {defineHotkey(hotkey.key)
          .split(',')[0]
          .split('+')
          .map(keyboardKey => (
            <S.KeyboardKey key={`${keyboardKey}`}>
              {keyboardKey === 'command' ? 'Cmd' : keyboardKey.charAt(0).toUpperCase() + keyboardKey.slice(1) || ','}
            </S.KeyboardKey>
          ))}
      </S.CommandsContainer>
    </S.HotkeyLabelContainer>
  );
};

export default HotkeyLabel;
