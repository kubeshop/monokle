import {shell} from 'electron';

import {useEffect, useState} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  setIsFromBackToStart,
  setIsInQuickClusterMode,
  setLeftMenuSelection,
  setShowStartPageLearn,
  setStartPageMenuOption,
  toggleStartProjectPane,
} from '@redux/reducers/ui';

import {IconButton} from '@atoms';

import {useStartPageOptions} from '@hooks/useStartPageOptions';

import {useWindowSize} from '@utils/hooks';

import AnnotationHeart from '@assets/AnnotationHeart.svg';

import {StartPageMenuOptions} from '@shared/models/ui';
import {trackEvent} from '@shared/utils/telemetry';

import * as S from './StartPage.styled';
import StartPageHeader from './StartPageHeader';

export interface NewsFeedItem {
  title: string;
  type: string;
  url: string;
  description: string;
  date: string;
  tags: string[];
  imageUrl: string;
}

const StartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const isStartPageLearnVisible = useAppSelector(state => state.ui.startPage.learn.isVisible);
  const projects = useAppSelector(state => state.config.projects);
  const selectedOption = useAppSelector(state => state.ui.startPage.selectedMenuOption);
  const isFromBackToStart = useAppSelector(state => state.ui.startPage.fromBackToStart);
  const [newsFeed, setNewsFeed] = useState<NewsFeedItem[]>([]);

  const {height, width} = useWindowSize();

  const options = useStartPageOptions();

  const onClickQuickClusterLoad = () => {
    trackEvent('dashboard/open', {from: 'start-screen-quick-quick-cluster-mode'});
    dispatch(setLeftMenuSelection('dashboard'));
    dispatch(setIsInQuickClusterMode(true));
    dispatch(toggleStartProjectPane());
  };

  const onClickBrowseHelmCharts = () => {
    dispatch(setIsInQuickClusterMode(true));
    dispatch(setLeftMenuSelection('helm'));
    dispatch(toggleStartProjectPane());
  };

  useEffect(() => {
    if (!isStartPageLearnVisible || selectedOption === 'learn') {
      return;
    }

    dispatch(setStartPageMenuOption('learn'));
  }, [dispatch, isStartPageLearnVisible, selectedOption]);

  useEffect(() => {
    if (projects.length && selectedOption !== 'projects' && !isFromBackToStart) {
      dispatch(setStartPageMenuOption('projects'));
    }

    if (isFromBackToStart) {
      dispatch(setIsFromBackToStart(false));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isFromBackToStart) {
      fetch('https://monokle-news-api.kubeshop.workers.dev/')
        .then(response => response.json())
        .then(data => {
          setNewsFeed(data);
        });
      console.log('%cNews Feed data is set', 'color: green; font-size: 16px; font-weight: bold;');
    }
  }, [isFromBackToStart]);

  const openNewsFeedItem = (url: string) => {
    shell.openExternal(url);
  };

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
                trackEvent('app_start/select_page', {page: key});

                if (key === 'quick-cluster-mode') {
                  onClickQuickClusterLoad();
                  return;
                }
                if (key === 'helm-pane') {
                  onClickBrowseHelmCharts();
                  return;
                }

                dispatch(setStartPageMenuOption(key as StartPageMenuOptions));
                if (isStartPageLearnVisible) {
                  dispatch(setShowStartPageLearn(false));
                }
              }}
            >
              <IconButton>{value.icon}</IconButton>
              {width > 1070 && value.label}
            </S.MenuOption>
          ))}
        </S.Menu>

        <S.ContentContainer>
          <S.ContentTitle>{options[selectedOption].title}</S.ContentTitle>
          {options[selectedOption].content}
        </S.ContentContainer>

        <S.NewsFeedContainer>
          <S.NewsFeed>
            <S.NewsFeedHeader>
              <S.NewsFeedIcon>
                <img src={AnnotationHeart} alt="news feed icon" />
              </S.NewsFeedIcon>
              What&lsquo;s New?
            </S.NewsFeedHeader>
            <S.NewsFeedContent>
              {newsFeed.map(item => (
                <S.NewsFeeditem
                  onClick={() => {
                    openNewsFeedItem(item.url);
                  }}
                >
                  <S.NewsFeedItemTime>
                    {Math.floor((new Date().getTime() - new Date(item.date).getTime()) / (1000 * 60 * 60 * 24))}
                    {' days'}
                  </S.NewsFeedItemTime>
                  <S.NewsFeedItemTitle>{item.title}</S.NewsFeedItemTitle>
                </S.NewsFeeditem>
              ))}
            </S.NewsFeedContent>
          </S.NewsFeed>
        </S.NewsFeedContainer>
      </S.MainContainer>
    </S.StartPageContainer>
  );
};

export default StartPage;
