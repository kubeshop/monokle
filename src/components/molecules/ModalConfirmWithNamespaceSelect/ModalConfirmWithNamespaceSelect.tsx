import * as k8s from '@kubernetes/client-node';

import React, {useCallback, useEffect, useState} from 'react';

import {Input, Modal, Radio, Select} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {AlertEnum, AlertType} from '@models/alert';
import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';

import {useTargetClusterNamespaces} from '@hooks/useTargetClusterNamespaces';

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
  onOk: (selectedNamespace?: string) => void;
  onCancel: () => void;
}

const ModalConfirmWithNamespaceSelect: React.FC<IProps> = props => {
  const {isVisible, resources = [], title, onCancel, onOk} = props;

  const dispatch = useAppDispatch();
  const currentContext = useAppSelector(state => state.config.kubeConfig.currentContext);
  const kubeconfigPath = useAppSelector(state => state.config.kubeconfigPath);

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
      const kc = new k8s.KubeConfig();
      kc.loadFromFile(kubeconfigPath);
      kc.setCurrentContext(currentContext || '');

      const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);

      k8sCoreV1Api
        .createNamespace({metadata: {name: createNamespaceName}})
        .then(() => {
          const alert: AlertType = {
            type: AlertEnum.Success,
            title: `Created ${createNamespaceName} namespace to cluster ${currentContext} successfully`,
            message: '',
          };

          dispatch(setAlert(alert));
          onOk(createNamespaceName);
        })
        .catch(err => {
          if (err.statusCode === 409) {
            setErrorMessage('Namespace already exists in the cluster!');
          } else {
            setErrorMessage(err.message);
          }
        });
    } else if (selectedOption === 'existing') {
      onOk(selectedNamespace);
    } else if (selectedOption === 'none') {
      onOk();
    }
  }, [currentContext, createNamespaceName, dispatch, kubeconfigPath, selectedNamespace, selectedOption, onOk]);

  useEffect(() => {
    if (defaultOption && defaultOption === 'none') {
      setSelectedOption('none');
      setSelectedNamespace('defualt');
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
        <HeadlineLabel>Select namespace:</HeadlineLabel>
        <Radio.Group
          key={selectedOption}
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
