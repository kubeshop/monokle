import {useCallback, useState} from 'react';

import {Input, Modal, Radio, Select} from 'antd';

import {useTargetClusterNamespaces} from '@hooks/useTargetClusterNamespaces';

import * as S from './HelmChartModalConfirmWithNamespaceSelect.styled';

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
  }, [createNamespaceName, selectedNamespace, selectedOption, onOk]);

  return (
    <Modal
      centered
      title={
        <S.TitleContainer>
          <S.TitleIcon />
          {title}
        </S.TitleContainer>
      }
      visible={isVisible}
      onCancel={onCancel}
      onOk={onClickOk}
    >
      <>
        <S.HeadlineLabel>Select namespace:</S.HeadlineLabel>
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
          <S.NamespaceContainer>
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
          </S.NamespaceContainer>
        ) : selectedOption === 'create' ? (
          <>
            <S.NamespaceContainer>
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
            </S.NamespaceContainer>
            {errorMessage && <S.ErrorMessageLabel>*{errorMessage}</S.ErrorMessageLabel>}
          </>
        ) : null}
      </>
    </Modal>
  );
};

export default HelmChartModalConfirmWithNamespaceSelect;
