import {useCallback} from 'react';

import {setSelectedNamespaces} from '@redux/dashboard/slice';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {TitleBarWrapper} from '@components/atoms/StyledComponents/TitleBarWrapper';

import NamespaceHandler from '@src/kindhandlers/Namespace.handler';

import {TitleBar} from '@monokle/components';
import {K8sResource} from '@shared/models/k8sResource';
import {trackEvent} from '@shared/utils/telemetry';

import * as S from './Header.styled';

export const Header = ({title}: {title: string}) => {
  const dispatch = useAppDispatch();
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedNamespaces = useAppSelector(state => state.dashboard.ui.selectedNamespaces);

  const getNamespaces = useCallback((): K8sResource[] => {
    return Object.values(resourceMap)
      .filter((resource: K8sResource) => resource.filePath.startsWith('preview://'))
      .filter(resource => resource.kind === NamespaceHandler.kind);
  }, [resourceMap]);

  return (
    <S.Container>
      <TitleBarWrapper>
        <TitleBar
          type="secondary"
          title={title}
          actions={
            <S.Select
              mode="multiple"
              allowClear
              maxTagCount="responsive"
              showSearch
              placeholder="Search to Select"
              value={selectedNamespaces}
              filterOption={(input: any, option: any) => (option?.label ?? '').includes(input)}
              filterSort={(optionA: any, optionB: any) =>
                (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
              }
              onChange={(values: any) => {
                trackEvent('dashboard/changeNamespace');
                values && values.length > 0
                  ? dispatch(setSelectedNamespaces(values))
                  : dispatch(setSelectedNamespaces([]));
              }}
              options={[...getNamespaces().map(resource => ({label: resource.name, value: resource.name}))]}
            />
          }
        />
      </TitleBarWrapper>
    </S.Container>
  );
};
