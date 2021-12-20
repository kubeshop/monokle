import React, {useEffect, useState} from 'react';

import {Input, Modal, Radio, Select} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {K8sResource} from '@models/k8sresource';

import {useTargetClusterNamespaces} from '@hooks/useTargetClusterNamespaces';

import {getDefaultNamespace} from '@utils/resources';

import Colors from '@styles/Colors';

const NamespaceContainer = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-column-gap: 10px;
  align-items: center;
  margin-top: 16px;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

interface IProps {
  isModalVisible: boolean;
  resources?: K8sResource[];
  title: string;
  onOk: (selectedNamspace: string) => void;
  onCancel: () => void;
}

const ModalConfirmWithNamespaceSelect: React.FC<IProps> = props => {
  const {isModalVisible, resources = [], title, onCancel, onOk} = props;

  const defaultNamespace = getDefaultNamespace(resources);
  const [namespaces] = useTargetClusterNamespaces({});

  const [createNamespaceName, setCreateNamespaceName] = useState(defaultNamespace);
  const [selectedNamespace, setSelectedNamespace] = useState(defaultNamespace);
  const [selectedOption, setSelectedOption] = useState<string>();

  useEffect(() => {
    if (!namespaces.includes(defaultNamespace)) {
      setSelectedOption('create');
      setSelectedNamespace('default');
    } else {
      setSelectedOption('existing');
      setSelectedNamespace(defaultNamespace);
    }
  }, [namespaces]);

  if (!selectedOption) {
    return null;
  }

  return (
    <Modal
      centered
      visible={isModalVisible}
      title={
        <TitleContainer>
          <ExclamationCircleOutlined style={{marginRight: '10px', color: Colors.yellowWarning}} />
          {title}
        </TitleContainer>
      }
      onOk={() => {
        onOk(selectedNamespace);
      }}
      onCancel={onCancel}
    >
      <>
        <Radio.Group key={selectedOption} onChange={e => setSelectedOption(e.target.value)} value={selectedOption}>
          <Radio value="existing">Use existing namespace</Radio>
          <Radio value="create">Create namespace</Radio>
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
              {namespaces.map(namespace => {
                if (typeof namespace !== 'string') {
                  return null;
                }

                return (
                  <Select.Option key={namespace} value={namespace}>
                    {namespace}
                  </Select.Option>
                );
              })}
            </Select>
          </NamespaceContainer>
        ) : (
          <NamespaceContainer>
            <span>Namespace name:</span>
            <Input
              autoFocus
              defaultValue={createNamespaceName}
              placeholder="Enter namespace name"
              value={createNamespaceName}
              onChange={e => setCreateNamespaceName(e.target.value)}
            />
          </NamespaceContainer>
        )}
      </>
    </Modal>
  );
};

export default React.memo(ModalConfirmWithNamespaceSelect);
