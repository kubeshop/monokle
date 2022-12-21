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
          {label: <div>Recent projects</div>, key: 'recent-projects', children: <>Recent projects</>},
          {label: <div>All projects</div>, key: 'all-projects', children: <>All projects</>},
          {label: <div>Settings</div>, key: 'settings', children: <>Settings</>},
        ]}
      />
    </S.StartPageContainer>
  );
};

export default StartPage;
