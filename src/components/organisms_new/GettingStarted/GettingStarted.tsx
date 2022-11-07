import {useMemo} from 'react';

import {useAppSelector} from '@redux/hooks';

// import ValidationOverView from "@organisms/ValidationPane/ValidationOverview/ValidationOverview";
import GettingStartedOverview from '@organismsNew/GettingStarted/GettingStartedOverview';

import {usePaneHeight} from '@hooks/usePaneHeight';

import * as S from './GettingStarted.styled';
import {SubTitle, Title} from './GettingStarted.styled';

// import {DEFAULT_PANE_TITLE_HEIGHT} from "@constants/constants";

const GettingStarted = () => {
  const integration = useAppSelector(state => state.main.validationIntegration);
  const height = usePaneHeight();

  const Panel = useMemo(() => {
    return GettingStartedOverview;
  }, [integration]);

  return (
    <S.GettingStartedContainer $height={height}>
      <Title>Starting with Monokle</Title>
      <SubTitle>
        Select in which stage of the K8s manifests management you are in (or from which one you want to learn more
        about) and let us show you how Monokle can help you.
      </SubTitle>

      <Panel />
    </S.GettingStartedContainer>
  );
};

export default GettingStarted;
