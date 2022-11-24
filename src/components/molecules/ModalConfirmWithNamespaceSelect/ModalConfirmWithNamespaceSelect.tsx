import * as k8s from '@kubernetes/client-node';

import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Input, Modal, Radio, Select} from 'antd';

import {useAppSelector} from '@redux/hooks';
import {currentClusterAccessSelector, kubeConfigPathSelector} from '@redux/selectors';

import {useTargetClusterNamespaces} from '@hooks/useTargetClusterNamespaces';

import {createKubeClient} from '@utils/kubeclient';
import {getDefaultNamespaceForApply} from '@utils/resources';

import {K8sResource} from '@shared/models/k8sResource';
import {kubeConfigContextSelector} from '@shared/utils/selectors';

import * as S from './ModalConfirmWithNamespaceSelect.styled';

interface IProps {
  isVisible: boolean;
  resources?: K8sResource[];
  title: string | JSX.Element;
  onOk: (namespace?: {name: string; new: boolean}) => void;
  onCancel: () => void;
}

const ModalConfirmWithNamespaceSelect: React.FC<IProps> = props => {
  const {isVisible, resources = [], title, onCancel, onOk} = props;

  const clusterAccess = useAppSelector(currentClusterAccessSelector);
  const clusterNamespaces = clusterAccess?.map(cl => cl.namespace);
  const defaultClusterNamespace = clusterNamespaces && clusterNamespaces.length ? clusterNamespaces[0] : 'default';
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);

  const {defaultNamespace, defaultOption} = getDefaultNamespaceForApply(resources, defaultClusterNamespace);
  const [namespaces] = useTargetClusterNamespaces();

  const hasOneNamespaceWithFullAccess = clusterAccess?.length === 1 && clusterAccess[0].hasFullAccess;

  const [createNamespaceName, setCreateNamespaceName] = useState<string>();
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedNamespace, setSelectedNamespace] = useState(defaultNamespace);
  const [selectedOption, setSelectedOption] = useState<'existing' | 'create' | 'none'>();

  const onClickOk = useCallback(() => {
    if (selectedOption === 'create') {
      if (!createNamespaceName) {
        setErrorMessage('Namespace name must not be empty!');
        return;
      }

      const kc = createKubeClient(kubeConfigPath, kubeConfigContext);
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
  }, [selectedOption, createNamespaceName, kubeConfigPath, kubeConfigContext, onOk, selectedNamespace]);

  const clusterScopedResourcesCount = useMemo(() => resources.filter(r => r.isClusterScoped).length, [resources]);
  const hasClusterScopedResources = useMemo(() => resources.some(r => !r.isClusterScoped), [resources]);
  const onlyClusterScopedResources = useMemo(() => resources.every(r => !r.isClusterScoped), [resources]);

  useEffect(() => {
    if (onlyClusterScopedResources) {
      return;
    }

    if (defaultOption && defaultOption === 'none') {
      setSelectedOption('none');
      setSelectedNamespace('default');
      setCreateNamespaceName('');
    } else if (!namespaces.includes(defaultNamespace) && hasOneNamespaceWithFullAccess) {
      setSelectedOption('create');
      setSelectedNamespace('default');
      setCreateNamespaceName(defaultNamespace);
    } else {
      setSelectedOption('existing');
      setSelectedNamespace(defaultNamespace);
      setCreateNamespaceName('');
    }
  }, [defaultOption, defaultNamespace, namespaces, hasOneNamespaceWithFullAccess, onlyClusterScopedResources]);

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
            setCreateNamespaceName('');
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
