import {useState} from 'react';

import {IconButton} from '@atoms';

import {usePaneHeight} from '@hooks/usePaneHeight';

import {Icon} from '@monokle/components';

import RecentProjects from '../RecentProjects';
import {SettingsPane} from '../SettingsPane';
import * as S from './StartPage.styled';
import StartPageHeader from './StartPageHeader';

type OptionsKeys = 'recent-projects' | 'all-projects' | 'settings';

const options = {
  'recent-projects': {
    icon: <S.SendOutlined />,
    label: 'Recent projects',
    content: <RecentProjects />,
  },
  'all-projects': {
    icon: <Icon name="all-projects" style={{fontSize: '16px'}} />,
    label: 'All projects',
    content: <>All projects</>,
  },
  settings: {
    icon: <S.SettingsOutlined />,
    label: 'Settings',
    content: <SettingsPane />,
  },
};

const StartPage: React.FC = () => {
  const height = usePaneHeight();

  const [selectedOption, setSelectedOption] = useState<OptionsKeys>('recent-projects');

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
          <S.ContentTitle>{options[selectedOption].label}</S.ContentTitle>
          {options[selectedOption].content}
        </S.ContentContainer>
      </S.MainContainer>
    </S.StartPageContainer>
  );
};

export default StartPage;
