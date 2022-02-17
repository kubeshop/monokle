import * as k8s from '@kubernetes/client-node';

import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Input, Modal, Radio, Select} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {K8sResource} from '@models/k8sresource';

import {useAppSelector} from '@redux/hooks';
import {kubeConfigContextSelector, kubeConfigPathSelector} from '@redux/selectors';

import {useTargetClusterNamespaces} from '@hooks/useTargetClusterNamespaces';

import {createKubeClient} from '@utils/kubeclient';
import {getDefaultNamespaceForApply} from '@utils/resources';

import Colors from '@styles/Colors';

const ErrorMessageLabel = styled.div`
  color: ${Colors.redError};
  margin-top: 10px;
`;

const HeadlineLabel = styled.div`
  margin-bottom: 16px;
`;

const NamespaceContainer = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-column-gap: 10px;
  align-items: center;
  margin-top: 24px;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const TitleIcon = styled(ExclamationCircleOutlined)`
  margin-right: 10px;
  color: ${Colors.yellowWarning};
`;

interface IProps {
  isVisible: boolean;
  resources?: K8sResource[];
  title: string;
  onOk: (namespace?: {name: string; new: boolean}) => void;
  onCancel: () => void;
}

const ModalConfirmWithNamespaceSelect: React.FC<IProps> = props => {
  const {isVisible, resources = [], title, onCancel, onOk} = props;

  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);

  const configState = useAppSelector(state => state.config);
  const {defaultNamespace, defaultOption} = getDefaultNamespaceForApply(resources);
  const [namespaces] = useTargetClusterNamespaces();

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

      const kc = createKubeClient(configState);
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
    } else if (selectedOption === 'none') {
      onOk();
    }
  }, [kubeConfigContext, createNamespaceName, kubeConfigPath, selectedNamespace, selectedOption, onOk, configState]);

  useEffect(() => {
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
  }, [defaultOption, defaultNamespace, namespaces]);

  const onlyNamespaces = useMemo(() => resources.every(r => r.kind === 'Namespace'), [resources]);
  const hasNamespaces = useMemo(() => resources.some(r => r.kind === 'Namespace'), [resources]);

  if (!selectedOption) {
    return null;
  }

  return (
    <Modal
      centered
      visible={isVisible}
      title={
        <TitleContainer>
          <TitleIcon style={{marginRight: '10px', color: Colors.yellowWarning}} />
          {title}
        </TitleContainer>
      }
      onOk={onClickOk}
      onCancel={onCancel}
    >
      <>
        <HeadlineLabel>
          Select namespace {hasNamespaces && !onlyNamespaces && ' for all non-Namespace resources'}:
        </HeadlineLabel>
        <Radio.Group
          key={selectedOption}
          disabled={onlyNamespaces}
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
          <NamespaceContainer>
            <span>Namespace:</span>
            <Select
              disabled={onlyNamespaces}
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
          </NamespaceContainer>
        ) : selectedOption === 'create' ? (
          <>
            <NamespaceContainer>
              <span>Namespace name:</span>
              <Input
                disabled={onlyNamespaces}
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
            </NamespaceContainer>
            {errorMessage && <ErrorMessageLabel>*{errorMessage}</ErrorMessageLabel>}
          </>
        ) : null}
      </>
    </Modal>
  );
};

export default React.memo(ModalConfirmWithNamespaceSelect);
