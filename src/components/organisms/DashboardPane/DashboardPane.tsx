import {useCallback, useEffect, useState} from 'react';

import {FundProjectionScreenOutlined} from '@ant-design/icons';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {setActiveDashboardMenu, setSelectedNamespace, setSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {KubeConfigManager} from '@redux/services/kubeConfigManager';

import {getRegisteredKindHandlers} from '@src/kindhandlers';

import {ErrorCell, Resource} from '../Dashboard/Tableview/TableCells.styled';
import * as S from './DashboardPane.style';
import {IMenu} from './menu';

const DashboardPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeMenu = useAppSelector(state => state.dashboard.ui.activeMenu);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedNamespace = useAppSelector(state => state.dashboard.ui.selectedNamespace);
  const leftMenu = useAppSelector(state => state.ui.leftMenu);
  const [menu, setMenu] = useState<IMenu[]>([]);
  const [filteredMenu, setFilteredMenu] = useState<any>([]);
  const [filterText, setFilterText] = useState<string>('');

  useEffect(() => {
    if (!filterText) {
      setFilteredMenu(menu);
      return;
    }

    setFilteredMenu(
      menu
        .map((menuItem: IMenu) => ({
          ...menuItem,
          children: menuItem.children?.filter((m: IMenu) => m.label.toLowerCase().includes(filterText.toLowerCase())),
        }))
        .filter((menuItem: IMenu) => menuItem.children && menuItem.children?.length > 0)
        .filter(
          (menuItem: IMenu) =>
            menuItem.children &&
            menuItem.children?.reduce((total: number, m: IMenu) => total + (m.resourceCount ? m.resourceCount : 0), 0) >
              0
        )
    );
  }, [filterText, menu]);

  useEffect(() => {
    let tempMenu: IMenu[] = [
      {
        key: 'Overview',
        label: 'Overview',
        children: [],
      },
    ];

    navSectionNames.representation[navSectionNames.K8S_RESOURCES].forEach((path: string) => {
      tempMenu.push({
        key: path,
        label: path,
        children: [],
      });
    });

    getRegisteredKindHandlers().forEach((kindHandler: ResourceKindHandler) => {
      const parent: IMenu | undefined = tempMenu.find(m => m.key === kindHandler.navigatorPath[1]);
      if (parent) {
        const child: IMenu | undefined = parent.children?.find(m => m.key === kindHandler.navigatorPath[2]);
        if (child) {
          child.children?.push({
            key: `${kindHandler.clusterApiVersion}-${kindHandler.kind}`,
            label: kindHandler.kind,
            children: [],
            resourceCount: getResourceCount(kindHandler.kind),
            errorCount: getErrorCount(kindHandler.kind),
          });
        } else {
          parent.children?.push({
            key: `${kindHandler.clusterApiVersion}-${kindHandler.kind}`,
            label: kindHandler.kind,
            children: [],
            resourceCount: getResourceCount(kindHandler.kind),
            errorCount: getErrorCount(kindHandler.kind),
          });
        }
      }
    });

    tempMenu = tempMenu.map((menuItem: IMenu) => ({
      ...menuItem,
      resourceCount: menuItem.children?.reduce(
        (total: number, m: IMenu) => total + (m.resourceCount ? m.resourceCount : 0),
        0
      ),
      errorCount: menuItem.children?.reduce((total: number, m: IMenu) => total + (m.errorCount ? m.errorCount : 0), 0),
    }));

    setMenu(tempMenu);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getRegisteredKindHandlers(), leftMenu, selectedNamespace, resourceMap]);

  useEffect(() => {
    dispatch(setActiveDashboardMenu({key: 'Overview', label: 'Overview'}));
    dispatch(setSelectedNamespace('ALL'));
  }, [dispatch]);

  const setActiveMenu = (menuItem: IMenu) => {
    dispatch(setActiveDashboardMenu(menuItem));
    dispatch(setSelectedResourceId());
  };

  const getResourceCount = useCallback(
    (kind: string) => {
      return Object.values(resourceMap)
        .filter((resource: K8sResource) => resource.filePath.startsWith('preview://'))
        .filter(
          r =>
            r.kind === kind &&
            (selectedNamespace !== 'ALL' && Boolean(r.namespace) ? selectedNamespace === r.namespace : true)
        ).length;
    },
    [resourceMap, selectedNamespace]
  );

  const getErrorCount = useCallback(
    (kind: string) => {
      return Object.values(resourceMap)
        .filter((resource: K8sResource) => resource.filePath.startsWith('preview://'))
        .filter(
          resource =>
            resource.kind === kind &&
            (selectedNamespace !== 'ALL' && Boolean(resource.namespace)
              ? selectedNamespace === resource.namespace
              : true)
        )
        .reduce((total: number, resource: K8sResource) => {
          if (resource.issues && resource.issues.errors) {
            total += resource.issues.errors.length;
          }
          if (resource.validation && resource.validation.errors) {
            total += resource.validation.errors.length;
          }
          return total;
        }, 0);
    },
    [resourceMap, selectedNamespace]
  );

  return (
    <S.Container>
      <S.HeaderContainer>
        <S.ClusterName
          title={new KubeConfigManager().getKubeConfig().currentContext}
          description={
            <div>
              <S.CheckCircleFilled />
              <S.ConnectedText>Connected</S.ConnectedText>
            </div>
          }
        />

        <S.FilterContainer>
          <S.Input
            placeholder=""
            prefix={<S.SearchOutlined />}
            onChange={(event: any) => setFilterText(event.target.value)}
            allowClear
          />
        </S.FilterContainer>
      </S.HeaderContainer>

      {filteredMenu.map((parent: IMenu) =>
        (parent.resourceCount && parent.resourceCount > 0) || parent.key === 'Overview' ? (
          <div key={parent.key}>
            <S.MainSection
              $clickable={parent.key === 'Overview' || parent.key === 'Node'}
              $active={activeMenu.key === parent.key}
              onClick={() => (parent.key === 'Overview' || parent.key === 'Node') && setActiveMenu(parent)}
            >
              {parent.key === 'Overview' && <FundProjectionScreenOutlined style={{marginRight: '8px'}} />}
              <span>{parent.label}</span>
            </S.MainSection>

            {parent.children?.map((child: IMenu) =>
              child.resourceCount ? (
                <S.SubSection
                  key={child.key}
                  $active={activeMenu.key === child.key}
                  onClick={() => setActiveMenu(child)}
                >
                  <span style={{marginRight: '4px'}}>{child.label}</span>
                  {child.resourceCount ? <Resource>{child.resourceCount}</Resource> : null}
                  {child.errorCount ? <ErrorCell>{child.errorCount}</ErrorCell> : null}
                </S.SubSection>
              ) : null
            )}
          </div>
        ) : null
      )}
    </S.Container>
  );
};

export default DashboardPane;
