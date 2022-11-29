import {useCallback} from 'react';

import {K8sResource} from '@models/k8sresource';

import {setSelectedNamespace} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import NamespaceHandler from '@src/kindhandlers/Namespace.handler';

import {TitleBar} from '@monokle/components';

import * as S from './Header.styled';

export const Header = ({title}: {title: string}) => {
  const dispatch = useAppDispatch();
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedNamespace = useAppSelector(state => state.dashboard.ui.selectedNamespace);

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
            showSearch
            placeholder="Search to Select"
            value={selectedNamespace}
            filterOption={(input: any, option: any) => (option?.label ?? '').includes(input)}
            filterSort={(optionA: any, optionB: any) =>
              (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
            }
            onSelect={(value: any) => dispatch(setSelectedNamespace(value))}
            options={[
              {label: 'All namespaces', value: 'ALL'},
              ...getNamespaces().map(resource => ({label: resource.name, value: resource.name})),
            ]}
          />
        }
      />
    </S.Container>
  );
};
