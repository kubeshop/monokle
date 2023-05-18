import {useState} from 'react';
import {monaco} from 'react-monaco-editor';
import MonacoEditor from 'react-monaco-editor/lib/editor';

import {Button, Input, Modal, Skeleton} from 'antd';

import {ChatCompletionRequestMessage} from 'openai';
import styled from 'styled-components';
import YAML from 'yaml';

import {YAML_DOCUMENT_DELIMITER} from '@constants/constants';

import {createChatCompletion} from '@redux/hackathon/hackathon.ipc';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeNewAiResourceWizard} from '@redux/reducers/ui';
import {extractK8sResources} from '@redux/services/resource';
import {createTransientResource} from '@redux/services/transientResource';
import {VALIDATOR} from '@redux/validation/validator';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';
import {transformResourceForValidation} from '@utils/resources';

import {Colors} from '@shared/styles/colors';
import {isDefined} from '@shared/utils/filter';

const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  readOnly: true,
  fontWeight: 'bold',
  minimap: {
    enabled: false,
  },
};

function isValidKubernetesYaml(yaml: string) {
  return yaml.includes('apiVersion') && yaml.includes('kind') && yaml.includes('metadata');
}

const GENERATION_ERROR_MESSAGE = 'No resource content was generated. Please try to give a better description.';

const codeRegex = /`{3}[\s\S]*?`{3}|`{1}[\s\S]*?`{1}/g;

const systemPrompt: ChatCompletionRequestMessage = {
  role: 'system',
  content: `
In this interaction, we'll be focusing on creating Kubernetes YAML code based on specific user inputs.
The aim is to generate a precise and functioning YAML code that matches the user's requirements.
Your output should consist exclusively of the YAML code necessary to fulfill the given task.
Remember, the output code may span across multiple documents if that's what's needed to incorporate all necessary Kubernetes objects.`,
};

const extractYamlDocuments = (content: string) => {
  const codeMatch = content.match(codeRegex);
  const documents = codeMatch?.map(match => {
    let formatted = match.replaceAll('`', '');
    if (formatted.startsWith('yaml')) {
      formatted = formatted.substring(4);
    }
    return formatted;
  });
  return documents?.filter(isValidKubernetesYaml);
};

const MonokleHackathon: React.FC = () => {
  const dispatch = useAppDispatch();
  const newAiResourceWizardState = useAppSelector(state => state.ui.newAiResourceWizard);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [manifestContentCode, setManifestContentCode] = useState<Array<string>>([]);

  const onCancel = () => {
    setInputValue('');
    dispatch(closeNewAiResourceWizard());
  };

  const onPreviewHandler = async () => {
    if (!inputValue) {
      setErrorMessage('Input must not be empty!');
      return;
    }

    setIsLoading(true);
    setManifestContentCode([]);
    setErrorMessage('');

    try {
      const messages: ChatCompletionRequestMessage[] = [systemPrompt, {role: 'user', content: inputValue}];
      let content = await createChatCompletion({messages});

      if (!content) {
        setErrorMessage(GENERATION_ERROR_MESSAGE);
        setIsLoading(false);
        return;
      }

      messages.push({role: 'assistant', content});

      let yamlDocuments = extractYamlDocuments(content);
      if (!yamlDocuments) {
        setErrorMessage(GENERATION_ERROR_MESSAGE);
        setIsLoading(false);
        return;
      }

      const resources = extractK8sResources(yamlDocuments.join('\n---\n'), 'transient', {createdIn: 'local'});
      const {response} = await VALIDATOR.runValidation({
        resources: resources.map(transformResourceForValidation).filter(isDefined),
      });

      const hasAnyErrors = response.runs.some(run => run.results.length > 0);

      if (hasAnyErrors) {
        let newPrompt = `
We will provide a list containing issues and possible fixes.
Based on that list, please rewrite the previous code blocks to fix all issues.
In the YAML code, write comments to explain what you changed and why.
`;
        response.runs
          .filter(run => run.tool.driver.name !== 'resource-links')
          .forEach(run => {
            run.results.forEach(result => {
              const help = run.tool.driver.rules.find(rule => rule.id === result.ruleId)?.help;
              newPrompt += `An issue is that ${result.message.text} and a possible fix is that ${help?.text}\n`;
            });
          });

        messages.push({role: 'user', content: newPrompt});
        content = await createChatCompletion({messages});

        if (!content) {
          setErrorMessage(GENERATION_ERROR_MESSAGE);
          setIsLoading(false);
          return;
        }

        yamlDocuments = extractYamlDocuments(content);
        if (!yamlDocuments) {
          setErrorMessage(GENERATION_ERROR_MESSAGE);
          setIsLoading(false);
          return;
        }
      }

      setManifestContentCode(yamlDocuments);
    } catch (e: any) {
      setErrorMessage(e.message);
    }

    setIsLoading(false);
  };

  const onOkHandler = async () => {
    manifestContentCode.forEach(code => {
      try {
        const parsedManifest = YAML.parse(code);
        createTransientResource(
          {
            name: parsedManifest.metadata.name,
            kind: parsedManifest.kind,
            namespace: parsedManifest.metadata.namespace || '',
            apiVersion: parsedManifest.apiVersion,
          },
          dispatch,
          'local',
          parsedManifest
        );
      } catch (error: any) {
        Modal.error({
          title: 'Could not create resource',
          content: error.message,
        });
      }
    });
    dispatch(closeNewAiResourceWizard());
  };

  return (
    <Modal
      title="Create Resource using AI"
      open={newAiResourceWizardState.isOpen}
      onCancel={onCancel}
      width="90vw"
      bodyStyle={{maxHeight: '1000px', overflowY: 'auto'}}
      okText="Create"
      onOk={onOkHandler}
    >
      <Note>
        Please provide precise and specific details for creating your desired Kubernetes resource. Feel free to ask for
        further explanations or additional information from the model regarding your requirements. Accurate details will
        help us meet your specific needs effectively.
      </Note>

      <Input.TextArea
        autoSize={{minRows: 2, maxRows: 6}}
        value={inputValue}
        onChange={e => {
          setErrorMessage('');
          setInputValue(e.target.value);
        }}
        placeholder="Enter resource specifications..."
      />

      {errorMessage && <ErrorMessage>*{errorMessage}</ErrorMessage>}

      <CreateButton onClick={onPreviewHandler} loading={isLoading}>
        Preview
      </CreateButton>

      {isLoading ? (
        <Skeleton active />
      ) : !manifestContentCode ? (
        <NoContent>There is not content yet to be shown</NoContent>
      ) : (
        <div>
          <MonacoEditor
            width="100%"
            height="450px"
            language="yaml"
            theme={KUBESHOP_MONACO_THEME}
            value={manifestContentCode.join(`\n${YAML_DOCUMENT_DELIMITER}\n`)}
            options={editorOptions}
          />
        </div>
      )}
    </Modal>
  );
};

export default MonokleHackathon;

// Styled Components

const CreateButton = styled(Button)`
  margin: 16px 0px 32px 0px;
`;

const ErrorMessage = styled.div`
  color: ${Colors.redError};
  margin-top: 4px;
`;

const NoContent = styled.div`
  color: ${Colors.grey7};
`;

const Note = styled.div`
  font-size: 12px;
  color: ${Colors.grey7};
  margin-bottom: 16px;
`;
