import {useState} from 'react';

import {SettingOutlined} from '@ant-design/icons';

import {IconButton} from '@atoms';

import {usePaneHeight} from '@hooks/usePaneHeight';

import {SettingsPane} from '../SettingsPane';
import * as S from './StartPage.styled';
import StartPageHeader from './StartPageHeader';

type OptionsKeys = 'recent-projects' | 'all-projects' | 'settings';

const options = {
  'recent-projects': {
    icon: <S.SendOutlined />,
    label: 'Recent projects',
    content: <div>Recent projects</div>,
  },
  'all-projects': {
    icon: <S.SendOutlined />,
    label: 'All projects',
    content: <>All projects</>,
  },
  settings: {
    icon: <SettingOutlined />,
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
