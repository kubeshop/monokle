import {useCallback, useEffect, useState} from 'react';

import {ClusterOutlined, FundProjectionScreenOutlined} from '@ant-design/icons';

import flatten, {unflatten} from 'flat';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {setActiveDashboardMenu, setSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {KubeConfigManager} from '@redux/services/kubeConfigManager';

import {getRegisteredKindHandlers} from '@src/kindhandlers';

import {ErrorCell, Resource, Warning} from '../Dashboard/Tableview/TableCells.styled';
import * as S from './DashboardPane.style';

const DashboardPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeMenu = useAppSelector(state => state.dashboard.ui.activeMenu);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedNamespace = useAppSelector(state => state.dashboard.ui.selectedNamespace);
  const leftMenu = useAppSelector(state => state.ui.leftMenu);
  const [menu, setMenu] = useState<any>({});
  const [filteredMenu, setFilteredMenu] = useState<any>({});
  const [filterText, setFilterText] = useState<string>('');

  useEffect(() => {
    if (!filterText) {
      setFilteredMenu(menu);
      return;
    }
    const flattenMenu = flatten<any, any>(menu, {
      safe: true,
      transformKey: (key: string) => `${key.replaceAll('.', '-')}`,
    });
    const filteredFlattenMenuArray = Object.keys(flattenMenu).filter(key =>
      key.toLowerCase().trim().includes(filterText.toLocaleLowerCase().trim())
    );
    const menuObject = filteredFlattenMenuArray.reduce(
      (output: any, value: string) => ({...output, [value]: {Overview: {}}}),
      {}
    );
    setFilteredMenu(unflatten(menuObject, {transformKey: (key: string) => key.replaceAll('-', '.')}));
  }, [filterText, menu]);

  useEffect(() => {
    setMenu(
      getRegisteredKindHandlers().reduce(
        (output: any, kindHandler: ResourceKindHandler) => {
          if (output[kindHandler.navigatorPath[1]]) {
            output[kindHandler.navigatorPath[1]] = {
              ...output[kindHandler.navigatorPath[1]],
              [kindHandler.kind]: {},
            };
          } else {
            output[kindHandler.navigatorPath[1]] = {[kindHandler.kind]: {}};
          }
          return output;
        },
        {Overview: {}, Node: {}}
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getRegisteredKindHandlers(), activeMenu, leftMenu]);

  const setActiveMenu = (section: string) => {
    dispatch(setActiveDashboardMenu(section));
    dispatch(setSelectedResourceId());
  };

  const getResourceCount = useCallback(
    (kind: string) => {
      return Object.values(resourceMap)
        .filter((resource: K8sResource) => resource.filePath.startsWith('preview://'))
        .filter(r => r.kind === kind && (selectedNamespace !== 'ALL' ? selectedNamespace === r.namespace : true))
        .length;
    },
    [resourceMap, selectedNamespace]
  );

  const getErrorCount = useCallback(
    (kind: string) => {
      return Object.values(resourceMap)
        .filter((resource: K8sResource) => resource.filePath.startsWith('preview://'))
        .filter(
          resource =>
            resource.kind === kind && (selectedNamespace !== 'ALL' ? selectedNamespace === resource.namespace : true)
        )
        .reduce(
          (total: number, resource: K8sResource) =>
            total + (resource.validation && resource.validation.errors ? resource.validation.errors.length : 0),
          0
        );
    },
    [resourceMap, selectedNamespace]
  );

  const getWarningCount = useCallback(
    (kind: string) => {
      return Object.values(resourceMap)
        .filter((resource: K8sResource) => resource.filePath.startsWith('preview://'))
        .filter(
          resource =>
            resource.kind === kind && (selectedNamespace !== 'ALL' ? selectedNamespace === resource.namespace : true)
        )
        .reduce(
          (total: number, resource: K8sResource) =>
            total + (resource.issues && resource.issues.errors ? resource.issues.errors.length : 0),
          0
        );
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

      {Object.keys(filteredMenu).map(section => (
        <div key={section}>
          <S.MainSection
            $clickable={section === 'Overview' || section === 'Node'}
            $active={activeMenu === section}
            onClick={() => (section === 'Overview' || section === 'Node') && setActiveMenu(section)}
          >
            {section === 'Overview' && <FundProjectionScreenOutlined style={{marginRight: '8px'}} />}
            {section === 'Node' && <ClusterOutlined style={{marginRight: '8px'}} />}
            {section}
          </S.MainSection>
          {Object.keys(filteredMenu[section]).map((subsection: any) => (
            <S.SubSection
              key={subsection}
              $active={activeMenu === subsection}
              onClick={() => setActiveMenu(subsection)}
            >
              <span style={{marginRight: '4px'}}>{subsection}</span>
              {getResourceCount(subsection) ? (
                <Resource style={{marginRight: '12px'}}>{getResourceCount(subsection)}</Resource>
              ) : null}
              {getErrorCount(subsection) ? (
                <ErrorCell style={{marginRight: '12px'}}>{getErrorCount(subsection)}</ErrorCell>
              ) : null}
              {getWarningCount(subsection) ? <Warning>{getWarningCount(subsection)}</Warning> : null}
            </S.SubSection>
          ))}
        </div>
      ))}
    </S.Container>
  );
};

export default DashboardPane;
