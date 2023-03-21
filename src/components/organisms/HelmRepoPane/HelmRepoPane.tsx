import {useState} from 'react';

import {Button} from 'antd';

import {LeftOutlined} from '@ant-design/icons';

import HelmChartsTable from './HelmChartsTable';

import * as S from './styled';

const menuItems = [
  {label: 'Browse Charts', key: 'browse-charts'},
  {label: 'Manage Repositories', key: 'manage-repositories'},
];

type MenuItemKeys = 'browse-charts' | 'manage-repositories';

const HelmRepoPane = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemKeys>('browse-charts');
  const onSelectItemMenuHandler = ({key}: any) => {
    setSelectedMenuItem(key);
  };

  return (
    <S.Container>
      <S.Header>
        <S.Menu
          style={{width: '100%'}}
          items={menuItems}
          mode="horizontal"
          onSelect={onSelectItemMenuHandler}
          selectedKeys={[selectedMenuItem]}
        />
        <Button size="large" type="primary" icon={<LeftOutlined />}>
          Back to Editor view
        </Button>
      </S.Header>
      {selectedMenuItem === 'browse-charts' && <HelmChartsTable />}
    </S.Container>
  );
};

export default HelmRepoPane;
