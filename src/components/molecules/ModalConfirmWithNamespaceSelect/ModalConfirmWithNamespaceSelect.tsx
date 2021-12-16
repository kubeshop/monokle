import {useState} from 'react';

import {Modal, Select} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useNamespaces} from '@hooks/useNamespaces';

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
  title: string;
  onOk: () => void;
  onCancel: () => void;
}

const ModalConfirmWithNamespaceSelect: React.FC<IProps> = props => {
  const {isModalVisible, title} = props;
  const {onOk, onCancel} = props;

  const [namespaces] = useNamespaces({extra: ['default']});

  const [selectedNamespace, setSelectedNamespace] = useState('default');

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
      onOk={onOk}
      onCancel={onCancel}
    >
      <NamespaceSelectContainer>
        <NamespaceSelectLabel>Namespace:</NamespaceSelectLabel>
        <Select
          value={selectedNamespace}
          showSearch
          defaultValue="default"
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

export default ModalConfirmWithNamespaceSelect;
