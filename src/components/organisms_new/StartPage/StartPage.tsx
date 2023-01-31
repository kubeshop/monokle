import {useEffect, useState} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  setIsInQuickClusterMode,
  setLeftMenuSelection,
  setShowStartPageLearn,
  setStartPageLearnTopic,
  toggleStartProjectPane,
} from '@redux/reducers/ui';

import {IconButton} from '@atoms';

import {useStartPageOptions} from '@hooks/useStartPageOptions';

import {useWindowSize} from '@utils/hooks';

import {WalkThrough} from '@monokle/components';
import {WALK_THROUGH_STEPS} from '@shared/constants/walkthrough';
import {trackEvent} from '@shared/utils/telemetry';

import * as S from './StartPage.styled';
import StartPageHeader from './StartPageHeader';

type OptionsKeys = 'recent-projects' | 'all-projects' | 'settings' | 'new-project' | 'quick-cluster-mode' | 'learn';

const StartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const isStartPageLearnVisible = useAppSelector(state => state.ui.startPageLearn.isVisible);
  const learnTopic = useAppSelector(state => state.ui.startPageLearn.learnTopic);
  const projects = useAppSelector(state => state.config.projects);

  const {height} = useWindowSize();

  const [selectedOption, setSelectedOption] = useState<OptionsKeys>(
    projects.length ? 'recent-projects' : 'new-project'
  );

  const options = useStartPageOptions();

  const onClickQuickClusterLoad = () => {
    trackEvent('dashboard/open', {from: 'start-screen-quick-quick-cluster-mode'});
    dispatch(setLeftMenuSelection('dashboard'));
    dispatch(setIsInQuickClusterMode(true));
    dispatch(toggleStartProjectPane());
  };

  useEffect(() => {
    if (!isStartPageLearnVisible || selectedOption === 'learn') {
      return;
    }

    setSelectedOption('learn');
  }, [isStartPageLearnVisible, selectedOption]);

  return (
    <S.StartPageContainer $height={height}>
      <StartPageHeader />

      <S.MainContainer>
        <S.Menu>
          {Object.entries(options).map(([key, value]) => (
            <S.MenuOption
              key={key}
              $active={!isStartPageLearnVisible && key === selectedOption}
              onClick={() => {
                if (key === 'quick-cluster-mode') {
                  onClickQuickClusterLoad();
                  return;
                }

                setSelectedOption(key as OptionsKeys);

                if (isStartPageLearnVisible) {
                  dispatch(setShowStartPageLearn(false));
                }
              }}
            >
              <IconButton>{value.icon}</IconButton>
              {value.label}
            </S.MenuOption>
          ))}
        </S.Menu>

        <S.ContentContainer>
          <S.ContentTitle>{options[selectedOption].title}</S.ContentTitle>
          {options[selectedOption].content}
        </S.ContentContainer>
        {learnTopic && (
          <WalkThrough
            mediaItems={WALK_THROUGH_STEPS[learnTopic]}
            topic={learnTopic}
            dismissWalkThrough={() => dispatch(setStartPageLearnTopic(undefined))}
          />
        )}
      </S.MainContainer>
    </S.StartPageContainer>
  );
};

export default StartPage;
