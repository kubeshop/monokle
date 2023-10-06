import {memo, useState} from 'react';

import {useAppSelector} from '@redux/hooks';

import {CommandPreview} from '@shared/models/preview';

import {usePreviewTrigger} from './usePreviewTrigger';

import * as S from './styled';

type IProps = {
  id: string;
};

const CommandRenderer: React.FC<IProps> = props => {
  const {id} = props;

  const command = useAppSelector(state => state.config.projectConfig?.savedCommandMap?.[id]);

  const isPreviewed = useAppSelector(
    state => state.main.preview?.type === 'command' && state.main.preview.commandId === command?.id
  );
  const thisPreview: CommandPreview = {type: 'command', commandId: id};
  const {isOptimisticLoading, triggerPreview, renderPreviewControls} = usePreviewTrigger(thisPreview);
  const mightBePreview = isPreviewed || isOptimisticLoading;

  const [isHovered, setIsHovered] = useState<boolean>(false);

  if (!command) {
    return null;
  }

  return (
    <S.ItemContainer
      indent={22}
      isHovered={isHovered}
      isPreviewed={mightBePreview}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={triggerPreview}
    >
      <S.ItemName isPreviewed={mightBePreview}>{command.label}</S.ItemName>
      {isOptimisticLoading && <S.ReloadIcon spin />}
      {renderPreviewControls()}
    </S.ItemContainer>
  );
};

export default memo(CommandRenderer);
