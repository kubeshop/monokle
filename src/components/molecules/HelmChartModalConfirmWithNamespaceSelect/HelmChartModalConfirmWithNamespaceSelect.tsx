import {useCallback, useState} from 'react';

import {Input, Modal, Radio, Select} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useTargetClusterNamespaces} from '@hooks/useTargetClusterNamespaces';

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
  title: string;
  onCancel: () => void;
  onOk: (selectedNamespace?: string, shouldCreateNamespace?: boolean) => void;
}

const HelmChartModalConfirmWithNamespaceSelect: React.FC<IProps> = props => {
  const {isVisible, title, onCancel, onOk} = props;

  const [namespaces] = useTargetClusterNamespaces();

  const [createNamespaceName, setCreateNamespaceName] = useState<string>();
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedNamespace, setSelectedNamespace] = useState('default');
  const [selectedOption, setSelectedOption] = useState<'existing' | 'create' | 'none'>('existing');

  const onClickOk = useCallback(() => {
    if (selectedOption === 'create') {
      if (!createNamespaceName) {
        setErrorMessage('Namespace name must not be empty!');
        return;
      }

      onOk(createNamespaceName, true);
    } else if (selectedOption === 'existing') {
      onOk(selectedNamespace);
    } else if (selectedOption === 'none') {
      onOk();
    }
  }, [selectedOption]);

  return (
    <Modal
      centered
      title={
        <TitleContainer>
          <TitleIcon style={{marginRight: '10px', color: Colors.yellowWarning}} />
          {title}
        </TitleContainer>
      }
      visible={isVisible}
      onCancel={onCancel}
      onOk={onClickOk}
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
              defaultValue="default"
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

export default HelmChartModalConfirmWithNamespaceSelect;
