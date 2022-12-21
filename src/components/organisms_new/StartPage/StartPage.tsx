import {SettingOutlined} from '@ant-design/icons';

import {IconButton} from '@atoms';

import {usePaneHeight} from '@hooks/usePaneHeight';

import * as S from './StartPage.styled';
import StartPageHeader from './StartPageHeader';

const StartPage: React.FC = () => {
  const height = usePaneHeight();

  return (
    <S.StartPageContainer $height={height}>
      <StartPageHeader />

      <S.Tabs
        tabPosition="left"
        items={[
          {
            label: (
              <S.TabItemLabel>
                <IconButton>
                  <S.SendOutlined />
                </IconButton>
                Recent projects
              </S.TabItemLabel>
            ),
            key: 'recent-projects',
            children: <>Recent projects</>,
          },
          {label: <S.TabItemLabel>All projects</S.TabItemLabel>, key: 'all-projects', children: <>All projects</>},
          {
            label: (
              <S.TabItemLabel>
                <IconButton>
                  <SettingOutlined />
                </IconButton>
                Settings
              </S.TabItemLabel>
            ),
            key: 'settings',
            children: <>Settings</>,
          },
        ]}
      />
    </S.StartPageContainer>
  );
};

export default StartPage;
