import {useEffect, useState} from 'react';

import {Skeleton} from 'antd';

import {Dictionary, groupBy, size, uniq} from 'lodash';

import navSectionNames from '@constants/navSectionNames';

import {currentKubeContextSelector} from '@redux/appConfig';
import {setDashboardMenuList} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {registeredKindHandlersSelector} from '@redux/selectors/resourceKindSelectors';
import {useResourceMetaMapRef} from '@redux/selectors/resourceMapSelectors';
import {problemsSelector, useValidationSelector} from '@redux/validation/validation.selectors';

import {useRefSelector} from '@utils/hooks';

import {ValidationResult} from '@monokle/validation';
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
  const clusterResourceMeta = useResourceMetaMapRef('cluster').current;
  const problems = useValidationSelector(problemsSelector);

  useEffect(() => {
    const groupedResources = groupBy(clusterResourceMeta, 'kind');
    let tempMenu: DashboardMenu[] = [
      {
        key: 'Overview',
        label: 'Overview',
        children: [],
      },
    ];

    navSectionNames.representation[navSectionNames.K8S_RESOURCES]
      .filter(r => r !== navSectionNames.CUSTOM)
      .forEach((path: string) => {
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
            errorCount: getProblemCount(groupedResources, problems, kindHandler.kind, 'error'),
            warningCount: getProblemCount(groupedResources, problems, kindHandler.kind, 'warning'),
            resourceCount: size(groupedResources[kindHandler.kind]) ?? 0,
            children: [],
          });
        } else {
          parent.children?.push({
            key: `${kindHandler.clusterApiVersion}-${kindHandler.kind}`,
            label: kindHandler.kind,
            errorCount: getProblemCount(groupedResources, problems, kindHandler.kind, 'error'),
            warningCount: getProblemCount(groupedResources, problems, kindHandler.kind, 'warning'),
            resourceCount: size(groupedResources[kindHandler.kind]) ?? 0,
            children: [],
          });
        }
      }
    });

    const kinds = uniq(Object.keys(groupedResources));
    const nonCustomKinds = tempMenu.map(i => i.children?.map(t => t.label)).flat();
    const customKinds = kinds.filter(k => !nonCustomKinds.includes(k));
    const customResources: DashboardMenu = {
      key: navSectionNames.CUSTOM,
      label: navSectionNames.CUSTOM,
      children: [],
    };

    if (customKinds.length > 0) {
      customKinds.forEach(kind => {
        customResources.children?.push({
          key: `${kind}`,
          label: kind,
          children: [],
          resourceCount: size(groupedResources[kind]) ?? 0,
        });
      });
      tempMenu.push(customResources);
    }
    dispatch(setDashboardMenuList(tempMenu));
  }, [registeredKindHandlers, leftMenu, selectedNamespace, dispatch, clusterResourceMeta, problems]);

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

const getProblemCount = (
  groupedResources: Dictionary<ResourceMeta<'cluster'>[]>,
  problems: ValidationResult[],
  kind: string,
  level: 'error' | 'warning'
) => {
  if (!groupedResources[kind]) return 0;

  return groupedResources[kind].reduce((total: number, resource: ResourceMeta) => {
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
};
