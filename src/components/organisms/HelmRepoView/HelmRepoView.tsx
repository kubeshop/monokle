import {useState} from 'react';
import {Tooltip} from 'antd';
import {Colors} from '@shared/styles';

import HelmChartsTable from './HelmChartsTable';
import HelmReposTable from './HelmReposTable';

import * as S from './styled';

const menuItems = [
  {label: 'Browse Charts', key: 'browse-charts'},
  {label: 'Manage Repositories', key: 'manage-repositories'},
];

type MenuItemKeys = 'browse-charts' | 'manage-repositories';

const TooltipDescription = () => {
  return (
    <S.DescriptionContainer>
      <S.HighlightedIcon name="helm" />
      <S.DescriptionTitle>In this section</S.DescriptionTitle>
      <ul>
        <li>Browse for Helm Charts</li>
        <li>Download or install desired Helm Chart</li>
        <li>Manage your Helm Charts</li>
        <li>Add & manage Helm Carts repositories</li>
      </ul>
      <S.HighlightedIcon name="document" />
      <S.DescriptionTitle>In Files section</S.DescriptionTitle>
      <ul>
        <li>View Helm Charts contained in your project</li>
        <li>Preview the output of a Helm Chart</li>
      </ul>
    </S.DescriptionContainer>
  );
};

const HelmRepoView = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemKeys>('browse-charts');
  const onSelectItemMenuHandler = ({key}: any) => {
    setSelectedMenuItem(key);
  };

  return (
    <S.Container>
      <div>
        <S.Title>Helm</S.Title>
        <Tooltip title={<TooltipDescription />} placement="rightTop" color={Colors.grey4}>
          <S.Link>Working with Helm in Monokle</S.Link>
        </Tooltip>
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
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        {selectedMenuItem === 'browse-charts' && <HelmChartsTable />}
        {selectedMenuItem === 'manage-repositories' && <HelmReposTable />}
      </div>
    </S.Container>
  );
};

export default HelmRepoView;
