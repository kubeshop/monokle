import {useState} from 'react';
import {monaco} from 'react-monaco-editor';
import MonacoEditor from 'react-monaco-editor/lib/editor';

import {Button, Input, Modal} from 'antd';

import styled from 'styled-components';

import {createChatCompletion} from '@redux/hackathon/hackathon.ipc';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeNewAiResourceWizard} from '@redux/reducers/ui';
import {extractK8sResources} from '@redux/services/resource';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import {Colors} from '@shared/styles/colors';

const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  selectOnLineNumbers: true,
  readOnly: true,
  fontWeight: 'bold',
  glyphMargin: true,
  minimap: {
    enabled: false,
  },
};

const MonokleHackathon: React.FC = () => {
  const dispatch = useAppDispatch();
  const newAiResourceWizardState = useAppSelector(state => state.ui.newAiResourceWizard);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [manifestContent, setManifestContent] = useState('');

  const onCancel = () => {
    setInputValue('');
    dispatch(closeNewAiResourceWizard());
  };

  const onCreateHandler = async () => {
    setIsLoading(true);
    setManifestContent('');

    try {
      const message = `${inputValue}. Show only the yaml content.`;

      const content = await createChatCompletion({message});

      if (!content) {
        setErrorMessage('No content was found!');
        return;
      }

      setManifestContent(content.replaceAll('`', ''));
      const test = extractK8sResources(content.replaceAll('`', ''), 'local', {filePath: '', fileOffset: 0});
    } catch (e: any) {
      setErrorMessage(e.message);
    }

    setIsLoading(false);
  };

  return (
    <Modal title="Create Resource using AI" open={newAiResourceWizardState.isOpen} onCancel={onCancel} width={1400}>
      <Input value={inputValue} onChange={e => setInputValue(e.target.value)} />

      <Button onClick={onCreateHandler} loading={isLoading}>
        Create
      </Button>

      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

      <div style={{marginTop: '30px'}}>Content:</div>

      <MonacoEditor
        width={500}
        height={500}
        language="yaml"
        theme={KUBESHOP_MONACO_THEME}
        value={manifestContent}
        options={editorOptions}
      />
    </Modal>
  );
};

export default MonokleHackathon;

// Styled Components

const ErrorMessage = styled.div`
  color: ${Colors.redError};
`;
