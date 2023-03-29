import * as k8s from '@kubernetes/client-node';

import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Input, Modal, Radio, Select} from 'antd';

import {currentClusterAccessSelector, kubeConfigContextSelector, kubeConfigPathSelector} from '@redux/appConfig';
import {useAppSelector} from '@redux/hooks';

import {useTargetClusterNamespaces} from '@hooks/useTargetClusterNamespaces';

import {getDefaultNamespaceForApply} from '@utils/resources';

import {ResourceMeta} from '@shared/models/k8sResource';
import {createKubeClient} from '@shared/utils/kubeclient';

import * as S from './ModalConfirmWithNamespaceSelect.styled';

interface IProps {
  isVisible: boolean;
  resourceMetaList?: ResourceMeta[];
  title: string | JSX.Element;
  onOk: (namespace?: {name: string; new: boolean}) => void;
  onCancel: () => void;
}

const ModalConfirmWithNamespaceSelect: React.FC<IProps> = props => {
  const {isVisible, resourceMetaList = [], title, onCancel, onOk} = props;

  const clusterAccess = useAppSelector(currentClusterAccessSelector);
  const clusterNamespaces = clusterAccess?.map(cl => cl.namespace);
  const defaultClusterNamespace = clusterNamespaces && clusterNamespaces.length ? clusterNamespaces[0] : 'default';
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const clusterProxyPort = useAppSelector(state => state.config.clusterProxyPort);

  const {defaultNamespace, defaultOption} = getDefaultNamespaceForApply(resourceMetaList, defaultClusterNamespace);

  const [namespaces] = useTargetClusterNamespaces();

  const [createNamespaceName, setCreateNamespaceName] = useState<string>();
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedNamespace, setSelectedNamespace] = useState(defaultNamespace);
  const [selectedOption, setSelectedOption] = useState<'existing' | 'create' | 'none'>();

  const onClickOk = useCallback(async () => {
    if (selectedOption === 'create') {
      if (!createNamespaceName) {
        setErrorMessage('Namespace name must not be empty!');
        return;
      }

      const kc = createKubeClient(kubeConfigPath, kubeConfigContext, clusterProxyPort);
      const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);

      k8sCoreV1Api
        .createNamespace({metadata: {name: createNamespaceName}})
        .then(() => {
          onOk({name: createNamespaceName, new: true});
        })
        .catch(err => {
          if (err.statusCode === 409) {
            setErrorMessage('Namespace already exists in the cluster!');
          } else {
            setErrorMessage(err.message);
          }
        });
    } else if (selectedOption === 'existing') {
      onOk({name: selectedNamespace, new: false});
    } else if (!selectedOption || selectedOption === 'none') {
      onOk();
    }
  }, [
    selectedOption,
    createNamespaceName,
    kubeConfigPath,
    kubeConfigContext,
    onOk,
    selectedNamespace,
    clusterProxyPort,
  ]);

  const clusterScopedResourcesCount = useMemo(
    () => resourceMetaList.filter(r => r.isClusterScoped).length,
    [resourceMetaList]
  );
  const hasClusterScopedResources = useMemo(() => resourceMetaList.some(r => !r.isClusterScoped), [resourceMetaList]);
  const onlyClusterScopedResources = useMemo(() => resourceMetaList.every(r => !r.isClusterScoped), [resourceMetaList]);

  useEffect(() => {
    if (onlyClusterScopedResources) {
      return;
    }

    if (defaultOption && defaultOption === 'none') {
      setSelectedOption('none');
      setSelectedNamespace('default');
      setCreateNamespaceName('');
    } else if (!namespaces.includes(defaultNamespace)) {
      setSelectedOption('create');
      setSelectedNamespace('default');
      setCreateNamespaceName(defaultNamespace);
    } else {
      setSelectedOption('existing');
      setSelectedNamespace(defaultNamespace);
      setCreateNamespaceName('');
    }
  }, [defaultOption, defaultNamespace, namespaces, onlyClusterScopedResources]);

  if (!onlyClusterScopedResources && !selectedOption) {
    return null;
  }

  return (
    <Modal
      bodyStyle={{display: onlyClusterScopedResources ? 'none' : 'block'}}
      centered
      open={isVisible}
      title={
        <S.TitleContainer>
          <S.TitleIcon />
          {title}
        </S.TitleContainer>
      }
      onOk={onClickOk}
      onCancel={onCancel}
    >
      <>
        <S.HeadlineLabel>
          Select target namespace
          {hasClusterScopedResources &&
            !onlyClusterScopedResources &&
            ` for ${clusterScopedResourcesCount} namespaced resources`}
          :
        </S.HeadlineLabel>
        <Radio.Group
          key={selectedOption}
          disabled={onlyClusterScopedResources}
          onChange={e => {
            setSelectedOption(e.target.value);
            setErrorMessage('');
          }}
          value={selectedOption}
        >
          <Radio value="existing">Use existing namespace</Radio>
          <Radio value="create">Create namespace</Radio>
          <Radio value="none">None</Radio>
        </Radio.Group>

        {selectedOption === 'existing' ? (
          <S.NamespaceContainer>
            <span>Namespace:</span>
            <Select
              disabled={onlyClusterScopedResources}
              value={selectedNamespace}
              showSearch
              defaultValue={defaultNamespace}
              onChange={value => setSelectedNamespace(value)}
            >
              {namespaces
                .filter(n => typeof n === 'string')
                .map(namespace => (
                  <Select.Option key={namespace} value={namespace}>
                    {namespace}
                  </Select.Option>
                ))}
            </Select>
          </S.NamespaceContainer>
        ) : selectedOption === 'create' ? (
          <>
            <S.NamespaceContainer>
              <span>Namespace name:</span>
              <Input
                disabled={onlyClusterScopedResources}
                autoFocus
                defaultValue={createNamespaceName}
                placeholder="Enter namespace name"
                value={createNamespaceName}
                onChange={e => {
                  setCreateNamespaceName(e.target.value);

                  if (errorMessage) {
                    setErrorMessage('');
                  }
                }}
              />
            </S.NamespaceContainer>
            {errorMessage && <S.ErrorMessageLabel>*{errorMessage}</S.ErrorMessageLabel>}
          </>
        ) : null}
      </>
    </Modal>
  );
};

export default React.memo(ModalConfirmWithNamespaceSelect);
