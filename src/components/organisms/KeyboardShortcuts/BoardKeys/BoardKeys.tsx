import * as S from './styled';

type BoardKeysProps = {
  bindings: string;
};

const BoardKeys = ({bindings}: BoardKeysProps) => {
  const commands: string[] = bindings.split(',').filter((item: string) => item);

  return (
    <S.StyledShortCut>
      {commands.map((command: string) => (
        <S.StyledShortCell key={command}>
          {command.split('+').map((keyboardKey: string) => (
            <S.StyledKey key={`${command}_${keyboardKey}`}>
              {keyboardKey === 'command' ? 'Cmd' : keyboardKey.charAt(0).toUpperCase() + keyboardKey.slice(1) || '+'}
            </S.StyledKey>
          ))}
        </S.StyledShortCell>
      ))}
    </S.StyledShortCut>
  );
};

export default BoardKeys;
