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
  setIsModalVisible: (value: boolean) => void;
}

const ALL_OPTIONS = '<all>';

const ModalConfirmWithNamespaceSelect: React.FC<IProps> = props => {
  const {isModalVisible, title} = props;
  const {onOk, setIsModalVisible} = props;

  const [namespaces] = useNamespaces({extra: ['all', 'default']});

  const [selectedNamespace, setSelectedNamespace] = useState(ALL_OPTIONS);

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
      onCancel={() => setIsModalVisible(false)}
    >
      <NamespaceSelectContainer>
        <NamespaceSelectLabel>Namespace:</NamespaceSelectLabel>
        <Select
          value={selectedNamespace}
          showSearch
          defaultValue={ALL_OPTIONS}
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
