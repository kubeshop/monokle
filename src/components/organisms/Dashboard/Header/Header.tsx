import {useCallback} from 'react';

import {K8sResource} from '@models/k8sresource';

import {setSelectedNamespaces} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {trackEvent} from '@utils/telemetry';

import NamespaceHandler from '@src/kindhandlers/Namespace.handler';

import {TitleBar} from '@monokle/components';

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
    </S.Container>
  );
};
