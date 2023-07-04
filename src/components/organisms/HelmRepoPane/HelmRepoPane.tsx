import {Tooltip, Typography} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openFolderExplorer, setHelmPaneMenuItem, setLeftMenuSelection} from '@redux/reducers/ui';

import {Colors} from '@shared/styles';
import {activeProjectSelector} from '@shared/utils';

import HelmChartsView from './HelmChartsView';
import HelmReposView from './HelmReposView';

import * as S from './styled';

const menuItems = [
  {label: 'Browse Charts', key: 'browse-charts'},
  {label: 'Manage Repositories', key: 'manage-repositories'},
];

const TooltipDescription = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);

  const onInClusterClickHandler = () => {
    dispatch(setLeftMenuSelection('dashboard'));
  };

  const onFileClickHandler = () => {
    if (activeProject) {
      dispatch(setLeftMenuSelection('explorer'));
    } else {
      dispatch(openFolderExplorer());
    }
  };

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
      <S.DescriptionTitle>
        In <Typography.Link onClick={onFileClickHandler}>Files section</Typography.Link>
      </S.DescriptionTitle>
      <ul>
        <li>View Helm Charts contained in your project</li>
        <li>Preview the output of a Helm Chart</li>
      </ul>

      <S.HighlightedIcon name="cluster-dashboard" />
      <S.DescriptionTitle>
        <Typography.Link onClick={onInClusterClickHandler}>In cluster</Typography.Link>
      </S.DescriptionTitle>
      <ul>
        <li>Check out chart releases update history and update to latest versions</li>
        <li>Find and install new Helm Charts</li>
        <li>Dry-run an update</li>
        <li>Uninstalling helm release</li>
        <li>Check out release manifest and further notes</li>
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
      </div>
    </S.Container>
  );
};

export default HelmRepoView;
