import {useCallback, useEffect, useState} from 'react';

import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {setActiveDashboardMenu} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {getRegisteredKindHandlers} from '@src/kindhandlers';

import {ErrorCell, Resource, Warning} from '../Dashboard/Tableview/TableCells.styled';
import * as S from './DashboardPane.style';

export const DashboardPane = () => {
  const dispatch = useAppDispatch();
  const activeMenu = useAppSelector(state => state.dashboard.ui.activeMenu);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedNamespace = useAppSelector(state => state.dashboard.ui.selectedNamespace);
  const leftMenu = useAppSelector(state => state.ui.leftMenu);
  const [menu, setMenu] = useState<any>({});

  useEffect(() => {
    setMenu(
      getRegisteredKindHandlers().reduce((output: any, kindHandler: ResourceKindHandler) => {
        if (output[kindHandler.navigatorPath[1]]) {
          output[kindHandler.navigatorPath[1]] = {
            ...output[kindHandler.navigatorPath[1]],
            [kindHandler.kind]: kindHandler,
          };
        } else {
          output[kindHandler.navigatorPath[1]] = {[kindHandler.kind]: kindHandler};
        }
        return output;
      }, menu)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getRegisteredKindHandlers(), activeMenu, leftMenu]);

  const getResourceCount = useCallback(
    (kind: string) => {
      return Object.values(resourceMap).filter(
        r => r.kind === kind && (selectedNamespace !== 'ALL' ? selectedNamespace === r.namespace : true)
      ).length;
    },
    [resourceMap, selectedNamespace]
  );

  const getErrorCount = (kind: string) => {
    return Object.values(resourceMap)
      .filter(
        resource =>
          resource.kind === kind && (selectedNamespace !== 'ALL' ? selectedNamespace === resource.namespace : true)
      )
      .reduce(
        (total: number, resource: K8sResource) =>
          total + (resource.validation && resource.validation.errors ? resource.validation.errors.length : 0),
        0
      );
  };

  const getWarningCount = (kind: string) => {
    return Object.values(resourceMap)
      .filter(
        resource =>
          resource.kind === kind && (selectedNamespace !== 'ALL' ? selectedNamespace === resource.namespace : true)
      )
      .reduce(
        (total: number, resource: K8sResource) =>
          total + (resource.issues && resource.issues.errors ? resource.issues.errors.length : 0),
        0
      );
  };

  return (
    <S.Container>
      {Object.keys(menu).map(section => (
        <div key={section}>
          <S.MainSection $active={activeMenu === section} onClick={() => dispatch(setActiveDashboardMenu(section))}>
            {section}
          </S.MainSection>
          {Object.keys(menu[section]).map((subsection: any) => (
            <S.SubSection
              key={subsection}
              $active={activeMenu === subsection}
              onClick={() => dispatch(setActiveDashboardMenu(subsection))}
            >
              <span style={{marginRight: '12px'}}>{subsection}</span>
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
