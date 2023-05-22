import {useState} from 'react';
import MonacoEditor from 'react-monaco-editor/lib/editor';
import {useMeasure} from 'react-use';

import {Button, Input, Modal, Spin} from 'antd';

import {ChatCompletionRequestMessage} from 'openai';
import styled from 'styled-components';
import YAML from 'yaml';

import {YAML_DOCUMENT_DELIMITER} from '@constants/constants';

import {createChatCompletion} from '@redux/hackathon/hackathon.ipc';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {selectResource} from '@redux/reducers/main';
import {closeNewAiResourceWizard} from '@redux/reducers/ui';
import {extractK8sResources} from '@redux/services/resource';
import {createTransientResource} from '@redux/services/transientResource';
import {pluginEnabledSelector} from '@redux/validation/validation.selectors';
import {VALIDATOR} from '@redux/validation/validator';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';
import {transformResourceForValidation} from '@utils/resources';

import {ValidationResponse} from '@monokle/validation';
import {AlertEnum} from '@shared/models/alert';
import {Colors} from '@shared/styles/colors';
import {isDefined} from '@shared/utils/filter';

import {EDITOR_OPTIONS, GENERATION_ERROR_MESSAGE, SYSTEM_PROMPT} from './constants';
import {extractYamlDocuments} from './utils';

const MonokleHackathon: React.FC = () => {
  const dispatch = useAppDispatch();
  const newAiResourceWizardState = useAppSelector(state => state.ui.newAiResourceWizard);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [manifestContentCode, setManifestContentCode] = useState<Array<string>>([]);
  const isOpaValidationEnabled = useAppSelector(state => pluginEnabledSelector(state, 'open-policy-agent'));

  const [monacoContainerRef, {width: containerWidth, height: containerHeight}] = useMeasure<HTMLDivElement>();

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
      const messages: ChatCompletionRequestMessage[] = [SYSTEM_PROMPT, {role: 'user', content: inputValue}];
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

      let hasAnyErrors = false;
      let validationResponse: ValidationResponse | undefined;

      if (isOpaValidationEnabled) {
        const resources = extractK8sResources(yamlDocuments.join('\n---\n'), 'transient', {createdIn: 'local'});
        const {response} = await VALIDATOR.runValidation({
          resources: resources.map(transformResourceForValidation).filter(isDefined),
        });
        validationResponse = response;
        hasAnyErrors = response.runs.some(run => run.results.length > 0);
      }

      if (hasAnyErrors) {
        let newPrompt = `
We will provide a list containing issues and possible fixes.
Based on that list, please rewrite the previous code blocks to fix all issues.
In the YAML code, write comments to explain what you changed and why.
`;
        validationResponse?.runs
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
    let firstResourceCreated = false;

    const manifests = manifestContentCode.map(m => m.split(YAML_DOCUMENT_DELIMITER)).flat();
    manifests.forEach(code => {
      try {
        const parsedManifest = YAML.parse(code);

        const newResource = createTransientResource(
          {
            name: parsedManifest.metadata.name,
            kind: parsedManifest.kind,
            namespace: parsedManifest.metadata.namespace || '',
            apiVersion: parsedManifest.apiVersion,
          },
          dispatch,
          'local',
          parsedManifest.spec
        );

        dispatch(setAlert({title: 'Resource created successfully', message: '', type: AlertEnum.Success}));

        if (!firstResourceCreated) {
          firstResourceCreated = true;
          dispatch(selectResource({resourceIdentifier: {id: newResource.id, storage: 'transient'}}));
        }
      } catch (error: any) {
        dispatch(setAlert({title: 'Could not create resource', message: error.message, type: AlertEnum.Error}));
      }
    });

    dispatch(closeNewAiResourceWizard());
  };

  return (
    <StyledModal
      title="Create Resource using AI"
      open={newAiResourceWizardState.isOpen}
      onCancel={onCancel}
      width="90%"
      okText="Create"
      onOk={onOkHandler}
    >
      <Note>
        Please provide precise and specific details for creating your desired Kubernetes resources. Accurate details
        will help us meet your specific needs effectively.
      </Note>

      <Input.TextArea
        autoSize={{minRows: 3, maxRows: 8}}
        value={inputValue}
        onChange={e => {
          setErrorMessage('');
          setInputValue(e.target.value);
        }}
        placeholder="Enter resource specifications ( e.g. Create deployment of nginx with 2 replicas )"
      />

      {errorMessage && <ErrorMessage>*{errorMessage}</ErrorMessage>}

      <CreateButton type="primary" onClick={onPreviewHandler} loading={isLoading}>
        Preview
      </CreateButton>

      {isLoading ? (
        <Spin tip="Your manifest is being generated. This might take a few minutes.">
          <SpinContainer />
        </Spin>
      ) : !manifestContentCode.length ? (
        <NoContent>No resources to preview.</NoContent>
      ) : (
        <div ref={monacoContainerRef} style={{height: 'calc(100% - 200px)', width: '100%'}}>
          <MonacoEditor
            width={containerWidth}
            height={containerHeight}
            language="yaml"
            theme={KUBESHOP_MONACO_THEME}
            value={manifestContentCode.join(`\n${YAML_DOCUMENT_DELIMITER}\n`)}
            options={EDITOR_OPTIONS}
          />
        </div>
      )}
    </StyledModal>
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
  color: ${Colors.grey6};
`;

const Note = styled.div`
  font-size: 12px;
  color: ${Colors.grey7};
  margin-bottom: 16px;
`;

const SpinContainer = styled.div`
  padding: 50px;
`;

const StyledModal = styled(Modal)`
  height: 75%;
  top: 45px;
  padding-bottom: 0px;

  .ant-modal-content {
    height: 100%;
  }

  .ant-modal-header,
  .ant-modal-body {
    background-color: #131515;
  }

  .ant-modal-body {
    height: 100%;
  }
`;
