import {useCallback, useEffect, useMemo, useState} from 'react';

import {Skeleton, Tooltip} from 'antd';

import {forEach, groupBy, size, uniq} from 'lodash';

import navSectionNames from '@constants/navSectionNames';

import {currentKubeContextSelector} from '@redux/appConfig';
import {setDashboardMenuList} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {registeredKindHandlersSelector} from '@redux/selectors/resourceKindSelectors';
import {useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';
import {problemsSelector, useValidationSelector} from '@redux/validation/validation.selectors';

import {AccordionPanel} from '@components/atoms';
import {InjectedPanelProps} from '@components/atoms/AccordionPanel/AccordionPanel';

import {useRefSelector} from '@utils/hooks';

import {TitleBar, TitleBarCount} from '@monokle/components';
import {DashboardMenu} from '@shared/models/dashboard';
import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

import DashboardFilteredMenu from './DashboardFilteredMenu';
import * as S from './DashboardPane.style';

const ClusterPane: React.FC<InjectedPanelProps> = props => {
  const {isActive} = props;

  const dispatch = useAppDispatch();
  const selectedNamespace = useAppSelector(state => state.main.clusterConnection?.namespace);
  const currentContext = useAppSelector(currentKubeContextSelector);
  const leftMenu = useAppSelector(state => state.ui.leftMenu);
  const [filterText, setFilterText] = useState<string>('');
  const registeredKindHandlers = useAppSelector(registeredKindHandlersSelector);
  const clusterConnectionOptions = useRefSelector(state => state.main.clusterConnectionOptions);
  const clusterResourceMeta = useResourceMetaMap('cluster');
  const problems = useValidationSelector(problemsSelector);
  const groupedResources = useMemo(() => groupBy(clusterResourceMeta, 'kind'), [clusterResourceMeta]);

  const getProblemCount = useCallback(
    (kind: string, level: 'error' | 'warning') => {
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
    },
    [groupedResources, problems]
  );

  useEffect(() => {
    let tempMenu: DashboardMenu[] = [
      {
        key: 'Overview',
        label: 'Overview',
        children: [],
      },
    ];

    navSectionNames.representation[navSectionNames.K8S_RESOURCES]
      .filter(r => ![navSectionNames.CUSTOM, navSectionNames.HELM].includes(r))
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
            errorCount: getProblemCount(kindHandler.kind, 'error'),
            warningCount: getProblemCount(kindHandler.kind, 'warning'),
            resourceCount: size(groupedResources[kindHandler.kind]) ?? 0,
            children: [],
          });
        } else {
          parent.children?.push({
            key: `${kindHandler.clusterApiVersion}-${kindHandler.kind}`,
            label: kindHandler.kind,
            errorCount: getProblemCount(kindHandler.kind, 'error'),
            warningCount: getProblemCount(kindHandler.kind, 'warning'),
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

    const helmResources: Array<ResourceMeta> = [];

    forEach(clusterResourceMeta, (resource: ResourceMeta) => {
      if ('helm.sh/chart' in (resource.labels || {})) {
        helmResources.push(resource);
      }
    });

    const groupHelmResources = groupBy(helmResources, 'kind');

    const helmReleaseMenu: DashboardMenu = {
      key: navSectionNames.HELM,
      label: navSectionNames.HELM,
      children: [],
    };

    forEach(groupHelmResources, (resources: Array<ResourceMeta>, kind: string) => {
      helmReleaseMenu.children?.push({
        key: `${kind}`,
        label: kind,
        children: [],
        resourceCount: size(resources) ?? 0,
      });
    });

    if (helmResources.length) {
      tempMenu.push(helmReleaseMenu);
    }

    dispatch(setDashboardMenuList(tempMenu));
  }, [
    registeredKindHandlers,
    leftMenu,
    selectedNamespace,
    dispatch,
    getProblemCount,
    groupedResources,
    clusterResourceMeta,
  ]);

  return (
    <AccordionPanel
      {...props}
      key="cluster-resources"
      showArrow={false}
      header={
        <TitleBar
          expandable
          isOpen={Boolean(isActive)}
          title="Resources"
          actions={<TitleBarCount count={size(clusterResourceMeta)} isActive={Boolean(isActive)} />}
          description={
            <S.ConnectedContainer>
              <Tooltip title="Successfully connected!" placement="bottomRight">
                <S.CheckCircleFilled />
              </Tooltip>
              <S.ConnectedText>{currentContext}</S.ConnectedText>
            </S.ConnectedContainer>
          }
        />
      }
    >
      <div style={{padding: '0px 16px 16px 16px'}}>
        {clusterConnectionOptions.current.isLoading ? (
          <Skeleton />
        ) : (
          <>
            <S.Input
              style={{marginBottom: 8}}
              placeholder=""
              prefix={<S.SearchOutlined />}
              onChange={(event: any) => setFilterText(event.target.value)}
              allowClear
            />
            <DashboardFilteredMenu filterText={filterText} />
          </>
        )}
      </div>
    </AccordionPanel>
  );
};

export default ClusterPane;
