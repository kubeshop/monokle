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
          .split(',')
          .filter((item: string) => item)
          .map(command =>
            command
              .split('+')
              .map(keyboardKey => (
                <S.Command key={`${command}-${keyboardKey}`}>
                  {keyboardKey === 'command'
                    ? 'Cmd'
                    : keyboardKey.charAt(0).toUpperCase() + keyboardKey.slice(1) || '+'}
                </S.Command>
              ))
          )}
      </S.CommandsContainer>
    </S.HotkeyLabelContainer>
  );
};

export default HotkeyLabel;
