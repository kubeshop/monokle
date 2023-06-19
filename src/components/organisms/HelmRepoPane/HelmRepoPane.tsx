import {Tooltip} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setHelmPaneMenuItem} from '@redux/reducers/ui';

import {Colors} from '@shared/styles';

import HelmChartsView from './HelmChartsView';
import HelmReleases from './HelmReleases';
import HelmReposView from './HelmReposView';

import * as S from './styled';

const menuItems = [
  {label: 'Browse Charts', key: 'browse-charts'},
  {label: 'Manage Repositories', key: 'manage-repositories'},
  {label: 'Manage Releases', key: 'manage-releases'},
];

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
  const dispatch = useAppDispatch();
  const selectedMenuItem = useAppSelector(state => state.ui.helmPane.selectedMenuItem);
  const onSelectItemMenuHandler = ({key}: any) => {
    dispatch(setHelmPaneMenuItem(key));
  };

  return (
    <S.Container>
      <div>
        <S.Title>Helm</S.Title>
        <Tooltip
          overlayStyle={{maxWidth: 'fit-content'}}
          title={<TooltipDescription />}
          placement="rightTop"
          color={Colors.grey4}
        >
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
        {selectedMenuItem === 'browse-charts' && <HelmChartsView />}
        {selectedMenuItem === 'manage-repositories' && <HelmReposView />}
        {selectedMenuItem === 'manage-releases' && <HelmReleases />}
      </div>
    </S.Container>
  );
};

export default HelmRepoView;
