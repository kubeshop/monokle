import {useEffect, useMemo, useState} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  setLeftMenuSelection,
  setPreviewingCluster,
  setShowStartPageLearn,
  toggleStartProjectPane,
} from '@redux/reducers/ui';

import {IconButton} from '@atoms';

import ProjectsList from '@components/molecules_new/ProjectsList';

import {useWindowSize} from '@utils/hooks';

import {Icon, LearnPage} from '@monokle/components';
import {openDiscord, openDocumentation, openTutorialVideo} from '@shared/utils/shell';
import {trackEvent} from '@shared/utils/telemetry';

import NewProject from '../NewProject';
import {SettingsPane} from '../SettingsPane';
import * as S from './StartPage.styled';
import StartPageHeader from './StartPageHeader';

type OptionsKeys = 'recent-projects' | 'all-projects' | 'settings' | 'new-project' | 'cluster-preview' | 'learn';

const StartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const isStartPageLearnVisible = useAppSelector(state => state.ui.startPageLearn.isVisible);
  const projects = useAppSelector(state => state.config.projects);

  const {height} = useWindowSize();

  const [selectedOption, setSelectedOption] = useState<OptionsKeys>(
    projects.length ? 'recent-projects' : 'new-project'
  );

  const options = useMemo(
    () => ({
      'recent-projects': {
        icon: <S.SendOutlined />,
        label: 'Recent projects',
        content: <ProjectsList type="recent" />,
        title: 'Recent projects',
      },
      'all-projects': {
        icon: <Icon name="all-projects" style={{fontSize: '16px'}} />,
        label: 'All projects',
        content: <ProjectsList type="all" />,
        title: 'All projects',
      },
      settings: {
        icon: <S.SettingsOutlined />,
        label: 'Settings',
        content: <SettingsPane />,
        title: 'Settings',
      },
      'new-project': {
        icon: <S.PlusOutlined />,
        label: 'New project',
        content: <NewProject />,
        title: 'Start something new',
      },
      'cluster-preview': {
        icon: <Icon name="cluster-dashboard" style={{fontSize: '16px'}} />,
        label: 'Cluster preview',
        content: null,
        title: '',
      },
      learn: {
        icon: null,
        label: 'Learn',
        content: (
          <LearnPage
            onHelpfulResourceCardClick={topic => {
              if (topic === 'documentation') {
                openDocumentation();
              } else if (topic === 'discord') {
                openDiscord();
              } else if (topic === 'video-tutorial') {
                openTutorialVideo();
              }
            }}
            onLearnCardClick={topic => {
              console.log(topic);
            }}
          />
        ),
        title: 'Learn',
      },
    }),
    []
  );

  const onClickClusterPreview = () => {
    trackEvent('dashboard/open', {from: 'start-screen-quick-cluster-preview'});
    dispatch(setLeftMenuSelection('dashboard'));
    dispatch(setPreviewingCluster(true));
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
                if (key === 'cluster-preview') {
                  onClickClusterPreview();
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
      </S.MainContainer>
    </S.StartPageContainer>
  );
};

export default StartPage;
