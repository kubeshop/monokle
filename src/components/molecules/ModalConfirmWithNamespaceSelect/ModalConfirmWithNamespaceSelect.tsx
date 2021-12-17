import React, {useState} from 'react';

import {Modal, Select} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {K8sResource} from '@models/k8sresource';

import {useTargetClusterNamespaces} from '@hooks/useTargetClusterNamespaces';

import {getDefaultNamespace} from '@utils/resources';

import Colors from '@styles/Colors';

const NamespaceSelectContainer = styled.div`
  display: flex;
  align-items: center;
`;

const NamespaceSelectLabel = styled.span`
  margin-right: 10px;
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

  const [selectedNamespace, setSelectedNamespace] = useState(defaultNamespace);

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
      onOk={() => onOk(selectedNamespace)}
      onCancel={onCancel}
    >
      <NamespaceSelectContainer>
        <NamespaceSelectLabel>Namespace:</NamespaceSelectLabel>
        <Select
          value={selectedNamespace}
          showSearch
          defaultValue={defaultNamespace}
          style={{width: '100%'}}
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
      </NamespaceSelectContainer>
    </Modal>
  );
};

export default React.memo(ModalConfirmWithNamespaceSelect);
