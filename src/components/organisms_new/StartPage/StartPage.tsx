import * as S from './StartPage.styled';

const StartPage: React.FC = () => {
  return (
    <div>
      <S.Tabs
        tabPosition="left"
        items={[
          {label: <div>Recent projects</div>, key: 'recent-projects', children: <>Recent projects</>},
          {label: <div>All projects</div>, key: 'all-projects', children: <>All projects</>},
          {label: <div>Settings</div>, key: 'settings', children: <>Settings</>},
        ]}
      />
    </div>
  );
};

export default StartPage;
