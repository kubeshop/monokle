import {useState} from 'react';

import {useAppSelector} from '@redux/hooks';

import {IconButton} from '@atoms';

import ProjectsList from '@components/molecules_new/ProjectsList';

import {usePaneHeight} from '@hooks/usePaneHeight';

import {Icon} from '@monokle/components';

import NewProject from '../NewProject';
import {SettingsPane} from '../SettingsPane';
import * as S from './StartPage.styled';
import StartPageHeader from './StartPageHeader';

type OptionsKeys = 'recent-projects' | 'all-projects' | 'settings' | 'new-project';

const options = {
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
};

const StartPage: React.FC = () => {
  const projects = useAppSelector(state => state.config.projects);

  const height = usePaneHeight();

  const [selectedOption, setSelectedOption] = useState<OptionsKeys>(
    projects.length ? 'recent-projects' : 'new-project'
  );

  return (
    <S.StartPageContainer $height={height}>
      <StartPageHeader />

      <S.MainContainer>
        <S.Menu>
          {Object.entries(options).map(([key, value]) => (
            <S.MenuOption
              key={key}
              $active={key === selectedOption}
              onClick={() => {
                setSelectedOption(key as OptionsKeys);
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
