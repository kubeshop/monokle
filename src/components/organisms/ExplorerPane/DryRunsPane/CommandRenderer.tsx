import {memo, useState} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {startPreview} from '@redux/thunks/preview';

import * as S from './styled';

type IProps = {
  id: string;
};

const CommandRenderer: React.FC<IProps> = props => {
  const {id} = props;

  const command = useAppSelector(state => state.config.projectConfig?.savedCommandMap?.[id]);

  const dispatch = useAppDispatch();
  const isPreviewed = useAppSelector(
    state => state.main.preview?.type === 'command' && state.main.preview.commandId === command?.id
  );

  const [isHovered, setIsHovered] = useState<boolean>(false);

  if (!command) {
    return null;
  }

  return (
    <S.ItemContainer
      indent={22}
      isHovered={isHovered}
      isPreviewed={isPreviewed}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        dispatch(startPreview({type: 'command', commandId: id}));
      }}
    >
      <S.ItemName isPreviewed={isPreviewed}>{command.label}</S.ItemName>
    </S.ItemContainer>
  );
};

export default memo(CommandRenderer);
