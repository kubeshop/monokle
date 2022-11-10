import {useMemo} from 'react';

import {useAppSelector} from '@redux/hooks';

// import ValidationOverView from "@organisms/ValidationPane/ValidationOverview/ValidationOverview";
import GettingStartedOverview from '@organismsNew/GettingStarted/GettingStartedOverview';

import {usePaneHeight} from '@hooks/usePaneHeight';

import * as S from './GettingStarted.styled';

// import {DEFAULT_PANE_TITLE_HEIGHT} from "@constants/constants";

const GettingStarted = () => {
  const integration = useAppSelector(state => state.main.validationIntegration);
  const height = usePaneHeight();

  const Panel = useMemo(() => {
    return GettingStartedOverview;
  }, [integration]);

  return (
    <S.GettingStartedContainer $height={height}>
      <Panel />
    </S.GettingStartedContainer>
  );
};

export default GettingStarted;
