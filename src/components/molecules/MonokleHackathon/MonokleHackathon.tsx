import {useState} from 'react';
import MonacoEditor from 'react-monaco-editor/lib/editor';
import {useMeasure} from 'react-use';

import {Button, Input, Modal, Spin} from 'antd';

import log from 'loglevel';
import styled from 'styled-components';
import YAML from 'yaml';

import {YAML_DOCUMENT_DELIMITER} from '@constants/constants';

import {setUserApiKey} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {closeNewAiResourceWizard} from '@redux/reducers/ui';
import {createTransientResource} from '@redux/services/transientResource';
import {pluginEnabledSelector} from '@redux/validation/validation.selectors';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import {AlertEnum} from '@shared/models/alert';
import {Colors} from '@shared/styles/colors';

import {generateYamlUsingAI} from './ai';
import {EDITOR_OPTIONS} from './constants';

const MonokleHackathon: React.FC = () => {
  const dispatch = useAppDispatch();
  const newAiResourceWizardState = useAppSelector(state => state.ui.newAiResourceWizard);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [editorCode, setEditorCode] = useState<string>();
  const apiKey = useAppSelector(state => state.config.userApiKeys.OpenAI);
  const isOpaValidationEnabled = useAppSelector(state => pluginEnabledSelector(state, 'open-policy-agent'));
  const [inputApiKey, setInputApiKey] = useState<string | undefined>();

  const [monacoContainerRef, {width: containerWidth, height: containerHeight}] = useMeasure<HTMLDivElement>();

  const onCancel = () => {
    setInputValue('');
    dispatch(closeNewAiResourceWizard());
  };

  const onGenerateHandler = async () => {
    if (!inputValue) {
      setErrorMessage('Input must not be empty!');
      return;
    }

    setIsLoading(true);
    setEditorCode(undefined);
    setErrorMessage(undefined);

    try {
      const generatedYaml = await generateYamlUsingAI({userPrompt: inputValue, shouldValidate: isOpaValidationEnabled});
      setEditorCode(generatedYaml);
    } catch (e: any) {
      setErrorMessage(e.message);
    }

    setIsLoading(false);
  };

  const onOkHandler = async () => {
    const manifests = editorCode?.split(YAML_DOCUMENT_DELIMITER);

    const namesOfCreatedResources: string[] = [];

    manifests?.forEach(code => {
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

        namesOfCreatedResources.push(newResource.name);

        dispatch(setAlert({title: 'Resource created successfully', message: '', type: AlertEnum.Success}));
      } catch (error: any) {
        log.error(error.message);
      }
    });

    if (namesOfCreatedResources.length) {
      dispatch(
        setAlert({
          title: 'Created resources successfully!',
          message: namesOfCreatedResources.join('\n'),
          type: AlertEnum.Success,
        })
      );
      dispatch(closeNewAiResourceWizard());
    } else {
      dispatch(
        setAlert({
          title: 'Could not create resources from the generated YAML.',
          message: '',
          type: AlertEnum.Error,
        })
      );
    }
  };

  return (
    <StyledModal
      title="Create Resources using AI"
      open={newAiResourceWizardState.isOpen}
      onCancel={onCancel}
      width="90%"
      okText="Create"
      onOk={onOkHandler}
    >
      {!apiKey && (
        <div>
          Please provide your OpenAI API key:{' '}
          <Input value={inputApiKey} onChange={e => setInputApiKey(e.target.value)} />
          <Button onClick={() => inputApiKey && dispatch(setUserApiKey({vendor: 'OpenAI', apiKey: inputApiKey}))}>
            Save
          </Button>
        </div>
      )}

      <Note>
        Please provide <strong>precise and specific details</strong> for creating your desired Kubernetes resources.
        Accurate details will help us meet your specific needs effectively.
      </Note>

      <Input.TextArea
        autoSize={{minRows: 3, maxRows: 8}}
        value={inputValue}
        onChange={e => {
          setErrorMessage('');
          setInputValue(e.target.value);
        }}
        placeholder="Enter requirements ( e.g. Create a Deployment using the nginx image, with 2 replicas, and expose port 80 through a ClusterIP Service )"
      />

      {errorMessage && <ErrorMessage>*{errorMessage}</ErrorMessage>}

      <CreateButton type="primary" onClick={onGenerateHandler} loading={isLoading}>
        Generate
      </CreateButton>

      {isLoading ? (
        <Spin tip="Your manifest is being generated. This might take a few minutes.">
          <SpinContainer />
        </Spin>
      ) : !editorCode ? (
        <NoContent>No resources to preview.</NoContent>
      ) : (
        <div ref={monacoContainerRef} style={{height: 'calc(100% - 200px)', width: '100%'}}>
          <MonacoEditor
            width={containerWidth}
            height={containerHeight}
            language="yaml"
            theme={KUBESHOP_MONACO_THEME}
            value={editorCode}
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
