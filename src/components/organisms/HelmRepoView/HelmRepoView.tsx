import {useState} from 'react';

import HelmChartsTable from './HelmChartsTable';
import HelmReposTable from './HelmReposTable';

import * as S from './styled';

const menuItems = [
  {label: 'Browse Charts', key: 'browse-charts'},
  {label: 'Manage Repositories', key: 'manage-repositories'},
];

type MenuItemKeys = 'browse-charts' | 'manage-repositories';

const HelmRepoView = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemKeys>('browse-charts');
  const onSelectItemMenuHandler = ({key}: any) => {
    setSelectedMenuItem(key);
  };

  return (
    <S.Container>
      <div>
        <S.Title>Helm</S.Title>
        <S.Link>Working with Helm in Monokle</S.Link>
      </div>
      <S.Header>
        <S.Menu
          style={{width: '100%'}}
          items={menuItems}
          mode="horizontal"
          onSelect={onSelectItemMenuHandler}
          selectedKeys={[selectedMenuItem]}
        />
      </S.Header>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        {selectedMenuItem === 'browse-charts' && <HelmChartsTable />}
        {selectedMenuItem === 'manage-repositories' && <HelmReposTable />}
      </div>
    </S.Container>
  );
};

export default HelmRepoView;
