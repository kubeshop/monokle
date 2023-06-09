import {useState} from 'react';
import MonacoEditor from 'react-monaco-editor/lib/editor';
import {useMeasure} from 'react-use';

import {Button, Spin, Switch} from 'antd';

import {SettingOutlined} from '@ant-design/icons';

import {uniq} from 'lodash';
import log from 'loglevel';
import YAML from 'yaml';

import {YAML_DOCUMENT_DELIMITER} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {closeNewAiResourceWizard} from '@redux/reducers/ui';
import {createTransientResource} from '@redux/services/transientResource';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import AIRobot from '@assets/AIRobot.svg';
import AIRobotColored from '@assets/AIRobotColored.svg';

import {AlertEnum} from '@shared/models/alert';
import {trackEvent} from '@shared/utils';

import * as S from './AIGenerationModal.styled';
import ApiKeyModal from './ApiKeyModal';
import {generateYamlUsingAI} from './ai.prompt';
import {EDITOR_OPTIONS} from './constants';

const VALIDATION_TOOLTIP = `This provides the option to validate the output based on your predefined validation settings.
While enabling validation enhances the quality of the results, it may also increase the processing time due to the extra validation procedures involved.`;

const CHANGE_API_KEY_TOOLTIP = `You can easily replace your current OpenAI API key with a new one to ensure secure and uninterrupted access to AI features.`;

const AIGenerationModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const newAiResourceWizardState = useAppSelector(state => state.ui.newAiResourceWizard);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [editorCode, setEditorCode] = useState<string>();
  const [isValidationEnabled, setIsValidationEnabled] = useState(true);
  const [areSettingsVisible, setAreSettingsVisible] = useState(false);

  const apiKey = useAppSelector(state => state.config.userApiKeys.OpenAI);
  const [isApiKeyModalVisible, setIsApiKeyModalVisible] = useState(false);

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

    if (!apiKey) {
      setIsApiKeyModalVisible(true);
      return;
    }

    setIsLoading(true);
    setEditorCode(undefined);
    setErrorMessage(undefined);

    try {
      const response = await generateYamlUsingAI({userPrompt: inputValue, shouldValidate: isValidationEnabled});
      if (response) {
        setEditorCode(response.yaml);
        trackEvent('ai/generation/success', {
          enabledValidation: isValidationEnabled,
          executionTime: response.executionTime,
        });
      } else {
        setErrorMessage('Could not generate YAML from the given input.');
      }
    } catch (e: any) {
      setErrorMessage(e.message);
    }

    setIsLoading(false);
  };

  const onOkHandler = async () => {
    const manifests = editorCode?.split(YAML_DOCUMENT_DELIMITER);

    const namesOfCreatedResources: string[] = [];
    const listOfResourceKinds: string[] = [];

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

        listOfResourceKinds.push(newResource.kind);
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
      trackEvent('ai/generation/created-resources', {
        resourceKinds: uniq(listOfResourceKinds),
        resourcesCount: namesOfCreatedResources.length,
      });
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
    <S.Modal
      title={null}
      open={newAiResourceWizardState.isOpen}
      onCancel={onCancel}
      width="80%"
      okText="Create resources from generated preview"
      onOk={onOkHandler}
      okButtonProps={{disabled: !editorCode}}
    >
      <S.ModalBody>
        <ApiKeyModal
          isVisible={isApiKeyModalVisible}
          onClose={() => {
            setIsApiKeyModalVisible(false);
          }}
        />

        {areSettingsVisible ? (
          <div>
            <img src={AIRobot} />
            <S.SettingsTitle>Settings</S.SettingsTitle>
            <S.EnableValidationContainer>
              <S.EnableValidationToggle onClick={() => setIsValidationEnabled(val => !val)}>
                <Switch checked={isValidationEnabled} /> Enable validation
              </S.EnableValidationToggle>
              <S.Note $small>{VALIDATION_TOOLTIP}</S.Note>
            </S.EnableValidationContainer>
            <div>
              <Button type="link" style={{padding: 0}} onClick={() => setIsApiKeyModalVisible(true)}>
                {apiKey ? 'Change' : 'Set'} API key
              </Button>
            </div>
            <S.Note $small>{CHANGE_API_KEY_TOOLTIP}</S.Note>
            <Button type="primary" onClick={() => setAreSettingsVisible(false)} style={{marginTop: 16}}>
              Done (Back)
            </Button>
          </div>
        ) : (
          <>
            <S.LeftColumn>
              <img src={AIRobot} />

              <S.Title>Create resources using AI</S.Title>

              <S.Note>
                Please provide <strong>precise and specific details</strong> for creating your desired Kubernetes
                resources. Accurate details will help us meet your specific needs effectively.
              </S.Note>

              <S.TextArea
                autoSize={{minRows: 8, maxRows: 16}}
                value={inputValue}
                onChange={e => {
                  setErrorMessage('');
                  setInputValue(e.target.value);
                }}
                placeholder="Enter requirements ( e.g. Create a Deployment using the nginx image, with 2 replicas, and expose port 80 through a ClusterIP Service )"
              />

              {errorMessage && <S.ErrorMessage>*{errorMessage}</S.ErrorMessage>}

              <S.CreateButton type="primary" onClick={onGenerateHandler} loading={isLoading}>
                Generate
              </S.CreateButton>
            </S.LeftColumn>

            <S.RightColumn>
              <S.SettingsButtonContainer>
                <Button type="link" icon={<SettingOutlined />} onClick={() => setAreSettingsVisible(true)}>
                  Settings
                </Button>
              </S.SettingsButtonContainer>
              {isLoading ? (
                <S.PlaceholderContainer>
                  <S.PlaceholderBody>
                    <Spin style={{width: '100%'}} tip="Resources are being generated. This might take a few minutes." />
                  </S.PlaceholderBody>
                </S.PlaceholderContainer>
              ) : !editorCode ? (
                <S.PlaceholderContainer>
                  <S.PlaceholderBody>
                    <img src={AIRobotColored} alt="AI Robot" />
                    <S.NoContentTitle>Nothing to preview</S.NoContentTitle>
                    <p>
                      Ask the AI to generate resources using the top left input, then preview the output and create the
                      resources if everything looks fine.
                    </p>
                  </S.PlaceholderBody>
                </S.PlaceholderContainer>
              ) : (
                <div ref={monacoContainerRef} style={{height: '100%', width: '100%', paddingBottom: '16px'}}>
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
            </S.RightColumn>
          </>
        )}
      </S.ModalBody>
    </S.Modal>
  );
};

export default AIGenerationModal;
