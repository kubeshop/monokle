import {macOSKeyIcon} from '@constants/tooltips';

import {useAppSelector} from '@redux/hooks';

import {hotkeys} from '@shared/constants/hotkeys';
import {Hotkey} from '@shared/models/hotkeys';
import {defineHotkey} from '@shared/utils/hotkey';

import * as S from './HotkeyLabel.styled';

interface IProps {
  name: Hotkey;
  text: string;
}

const HotkeyLabel: React.FC<IProps> = props => {
  const {name, text} = props;
  const osPlatform = useAppSelector(state => state.config.osPlatform);

  const hotkey = hotkeys[name];

  const renderKey = (keyboardKey: string) => {
    if (osPlatform === 'darwin' && macOSKeyIcon[keyboardKey]) {
      return macOSKeyIcon[keyboardKey];
    }

    return keyboardKey.charAt(0).toUpperCase() + keyboardKey.slice(1) || ',';
  };

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
            <S.KeyboardKey key={`${keyboardKey}`}>{renderKey(keyboardKey.trim())}</S.KeyboardKey>
          ))}
      </S.CommandsContainer>
    </S.HotkeyLabelContainer>
  );
};

export default HotkeyLabel;
