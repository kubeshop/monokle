import {memo, useState} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {startPreview} from '@redux/thunks/preview';

import * as S from './styled';

type IProps = {
  id: string;
};

const HelmValuesRenderer: React.FC<IProps> = props => {
  const {id} = props;

  const dispatch = useAppDispatch();
  const helmValues = useAppSelector(state => state.main.helmValuesMap[id]);

  const isPreviewed = useAppSelector(
    state => state.main.preview?.type === 'helm' && state.main.preview?.valuesFileId === helmValues.id
  );

  const [isHovered, setIsHovered] = useState<boolean>(false);

  if (!helmValues) return null;

  return (
    <S.ItemContainer
      indent={22}
      isHovered={isHovered}
      isPreviewed={isPreviewed}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        dispatch(startPreview({type: 'helm', chartId: helmValues.helmChartId, valuesFileId: id}));
      }}
    >
      <S.ItemName isPreviewed={isPreviewed}>{helmValues.name}</S.ItemName>
    </S.ItemContainer>
  );
};

export default memo(HelmValuesRenderer);
