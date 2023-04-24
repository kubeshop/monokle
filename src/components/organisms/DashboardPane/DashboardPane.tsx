import {useCallback, useEffect, useState} from 'react';

import {Skeleton} from 'antd';

import navSectionNames from '@constants/navSectionNames';

import {currentKubeContextSelector} from '@redux/appConfig';
import {setDashboardMenuList} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {registeredKindHandlersSelector} from '@redux/selectors/resourceKindSelectors';
import {useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';
import {problemsSelector, useValidationSelector} from '@redux/validation/validation.selectors';

import {useRefSelector} from '@utils/hooks';

import {DashboardMenu} from '@shared/models/dashboard';
import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

import DashboardFilteredMenu from './DashboardFilteredMenu';
import * as S from './DashboardPane.style';

const DashboardPane = () => {
  const dispatch = useAppDispatch();
  const selectedNamespace = useAppSelector(state => state.main.clusterConnection?.namespace);
  const currentContext = useAppSelector(currentKubeContextSelector);
  const leftMenu = useAppSelector(state => state.ui.leftMenu);
  const [filterText, setFilterText] = useState<string>('');
  const registeredKindHandlers = useAppSelector(registeredKindHandlersSelector);
  const clusterConnectionOptions = useRefSelector(state => state.main.clusterConnectionOptions);
  const clusterResourceMeta = useResourceMetaMap('cluster');

  const problems = useValidationSelector(state => problemsSelector(state));

  useEffect(() => {
    let tempMenu: DashboardMenu[] = [
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

    registeredKindHandlers.forEach((kindHandler: ResourceKindHandler) => {
      const parent: DashboardMenu | undefined = tempMenu.find(m => m.key === kindHandler.navigatorPath[1]);
      if (parent) {
        const child: DashboardMenu | undefined = parent.children?.find(m => m.key === kindHandler.navigatorPath[2]);
        if (child) {
          child.children?.push({
            key: `${kindHandler.clusterApiVersion}-${kindHandler.kind}`,
            label: kindHandler.kind,
            errorCount: getProblemCount(kindHandler.kind, 'error'),
            warningCount: getProblemCount(kindHandler.kind, 'warning'),
            resourceCount: getResourceCount(kindHandler.kind),
            children: [],
          });
        } else {
          parent.children?.push({
            key: `${kindHandler.clusterApiVersion}-${kindHandler.kind}`,
            label: kindHandler.kind,
            errorCount: getProblemCount(kindHandler.kind, 'error'),
            warningCount: getProblemCount(kindHandler.kind, 'warning'),
            resourceCount: getResourceCount(kindHandler.kind),
            children: [],
          });
        }
      }
    });

    dispatch(setDashboardMenuList(tempMenu));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registeredKindHandlers, leftMenu, selectedNamespace, clusterResourceMeta, problems]);

  const compareNamespaces = useCallback(
    (namespace?: string) => {
      if (clusterConnectionOptions.current.lastNamespaceLoaded === '<all>') {
        return true;
      }
      if (clusterConnectionOptions.current.lastNamespaceLoaded === '<not-namespaced>') {
        return !namespace;
      }
      return clusterConnectionOptions.current.lastNamespaceLoaded === namespace;
    },
    [clusterConnectionOptions]
  );

  const getResources = useCallback(
    (kind: string) => {
      return Object.values(clusterResourceMeta).filter(r => r.kind === kind && compareNamespaces(r.namespace));
    },
    [clusterResourceMeta, compareNamespaces]
  );

  const getResourceCount = useCallback((kind: string) => getResources(kind).length, [getResources]);

  const getProblemCount = useCallback(
    (kind: string, level: 'error' | 'warning') => {
      return getResources(kind).reduce((total: number, resource: ResourceMeta) => {
        const problemCount = problems.filter(
          p =>
            p.level === level &&
            p.locations.find(
              l =>
                l.physicalLocation?.artifactLocation.uriBaseId === 'RESOURCE' &&
                l.physicalLocation.artifactLocation.uri === resource.id
            )
        );
        return total + problemCount.length;
      }, 0);
    },
    [getResources, problems]
  );

  if (clusterConnectionOptions.current.isLoading) {
    return (
      <S.Container style={{padding: '16px'}}>
        <Skeleton />
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.HeaderContainer>
        <S.ClusterName
          title={currentContext}
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

      <DashboardFilteredMenu filterText={filterText} />
    </S.Container>
  );
};

export default DashboardPane;
