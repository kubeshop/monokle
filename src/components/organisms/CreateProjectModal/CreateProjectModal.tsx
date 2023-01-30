import {useCallback, useEffect, useState} from 'react';

import {Button, Form, Input, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import {existsSync} from 'fs';
import _ from 'lodash';
import path from 'path';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setCreateProject} from '@redux/reducers/appConfig';
import {closeCreateProjectModal, openTemplateExplorer, setTemplateProjectCreate} from '@redux/reducers/ui';

import {FileExplorer} from '@atoms';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {useFocus} from '@utils/hooks';

import {AnyTemplate} from '@shared/models/template';
import {Colors} from '@shared/styles/colors';
import {trackEvent} from '@shared/utils/telemetry';

export enum FormSteps {
  STEP_ONE = 1,
  STEP_TWO = 2,
}

const CreateProjectModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const projectsRootPath = useAppSelector(state => state.config.projectsRootPath);
  const uiState = useAppSelector(state => state.ui.createProjectModal);

  const [formStep, setFormStep] = useState(FormSteps.STEP_ONE);
  const [formValues, setFormValues] = useState({name: '', rootFolder: projectsRootPath});
  const [isEditingRootPath, setIsEditingRoothPath] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isModalHid, setIsModalHid] = useState(false);
  const [isSubmitEnabled, setSubmitEnabled] = useState(false);
  const [pickedPath, setPickedPath] = useState(projectsRootPath);
  const [selectedTemplate, setSelectedTemplate] = useState<AnyTemplate | undefined>(undefined);

  const [createProjectForm] = useForm();
  const [inputRef, focus] = useFocus<any>();

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (folderPath) {
        setPickedPath(folderPath);
        setFormValues({...formValues});
        setIsEditingRoothPath(false);
      }
    },
    {isDirectoryExplorer: true}
  );

  const setProjectRootPath = () => {
    let projectPath = formValues.rootFolder;
    if (!isEditingRootPath) {
      projectPath = formValues.name
        ? path.join(pickedPath, formValues.name.toLowerCase().replaceAll(' ', '-'))
        : pickedPath;
    }
    const pathExists = existsSync(projectPath);
    if (pathExists) {
      createProjectForm.setFields([
        {
          name: 'rootFolder',
          value: projectPath,
          errors: !formValues.name ? [] : ['Path exists!'],
        },
      ]);
      setSubmitEnabled(false);
    } else {
      createProjectForm.setFields([
        {name: 'rootFolder', value: projectPath, errors: projectPath ? [] : ['Please provide your local path!']},
      ]);
      setSubmitEnabled(Boolean(projectPath));
    }
  };

  useEffect(() => {
    setProjectRootPath();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedPath, formValues, isEditingRootPath]);

  useEffect(() => {
    setFormValues({...formValues, rootFolder: projectsRootPath});
    setIsEditingRoothPath(false);
    setPickedPath(projectsRootPath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsRootPath, uiState.isOpen]);

  const onFinish = (values: {name: string; rootFolder: string}) => {
    setFormValues({...values});
    setIsEditingRoothPath(false);

    if (uiState.fromTemplate && formStep === FormSteps.STEP_ONE) {
      setFormStep(FormSteps.STEP_TWO);
    }

    if (!uiState.fromTemplate && values.rootFolder && values.name) {
      trackEvent('app_start/create_project', {from: 'scratch'});
      dispatch(setCreateProject({...values}));
      closeModal();
    }
  };

  useEffect(() => {
    if (formStep === FormSteps.STEP_ONE) {
      setSubmitEnabled(isFormValid);
    } else if (formStep === FormSteps.STEP_TWO) {
      setSubmitEnabled(isFormValid && Boolean(selectedTemplate));
    } else {
      setSubmitEnabled(false);
    }
  }, [isFormValid, selectedTemplate, formStep]);

  useEffect(() => {
    if (uiState.isOpen) {
      focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiState.isOpen]);

  const closeModal = useCallback(() => {
    setFormValues({name: '', rootFolder: ''});
    setIsEditingRoothPath(false);
    createProjectForm.resetFields();
    setFormStep(FormSteps.STEP_ONE);
    setSelectedTemplate(undefined);
    setIsModalHid(false);
    setSubmitEnabled(false);
    setIsFormValid(false);
    dispatch(closeCreateProjectModal());
  }, [createProjectForm, dispatch]);

  useEffect(() => {
    const {name, rootFolder} = createProjectForm.getFieldsValue();

    if (!name || !rootFolder) {
      return;
    }

    if (formStep === FormSteps.STEP_ONE) {
      setIsFormValid(true);
    } else if (formStep === FormSteps.STEP_TWO) {
      setTemplateProjectCreate({name, rootFolder});
      closeModal();
      openTemplateExplorer();
    }
  }, [closeModal, createProjectForm, formStep]);

  if (!uiState.isOpen) {
    return null;
  }

  return (
    <Modal
      title={
        uiState.fromTemplate ? (
          <div>
            <div style={{color: `${Colors.grey800}`, fontSize: '10px'}}>Step {formStep} of 2</div>
            <div>Create a Project from a Template</div>
          </div>
        ) : (
          <div>Create an Empty Project</div>
        )
      }
      open={uiState?.isOpen}
      onCancel={closeModal}
      style={{opacity: isModalHid ? 0 : 1}}
      transitionName=""
      footer={
        <>
          <Button key="cancel" onClick={closeModal}>
            Cancel
          </Button>
          {uiState.fromTemplate && formStep === FormSteps.STEP_TWO && (
            <Button key="back" onClick={() => setFormStep(FormSteps.STEP_ONE)}>
              Back
            </Button>
          )}
          {formStep !== FormSteps.STEP_TWO && (
            <Button
              id="empty-project-save"
              key="submit"
              type="primary"
              disabled={!isSubmitEnabled}
              onClick={() => createProjectForm.submit()}
            >
              {uiState.fromTemplate && formStep === FormSteps.STEP_ONE ? 'Next: Select a Template' : 'Create Project'}
            </Button>
          )}
        </>
      }
    >
      <Form
        layout="vertical"
        form={createProjectForm}
        onFinish={onFinish}
        initialValues={() => formValues}
        onFieldsChange={field => {
          const name = field.filter(item => _.includes(item.name.toString(), 'name'));
          if (name && name.length > 0) {
            setFormValues({...formValues, name: name[0].value});
            setIsEditingRoothPath(false);
          }
          const rootFolder = field.filter(item => _.includes(item.name.toString(), 'rootFolder'));
          if (rootFolder && rootFolder.length > 0) {
            setFormValues({...formValues, rootFolder: rootFolder[0].value});
            setIsEditingRoothPath(true);
          }
        }}
      >
        <Form.Item
          name="name"
          label="Project Name"
          required
          tooltip="The name of your project throughout Monokle. Default is the name of your selected folder."
          rules={[
            {
              required: true,
              message: 'Please provide your project name!',
            },
          ]}
        >
          <Input ref={inputRef} />
        </Form.Item>

        <Form.Item label="Location" required tooltip="The local path where your project will live.">
          <Input.Group compact>
            <Form.Item
              name="rootFolder"
              noStyle
              rules={[
                {
                  required: true,
                  message: 'Please provide your local path!',
                },
              ]}
            >
              <Input style={{width: 'calc(100% - 100px)'}} />
            </Form.Item>
            <Button style={{width: '100px'}} onClick={openFileExplorer}>
              Browse
            </Button>
          </Input.Group>
        </Form.Item>
      </Form>

      <FileExplorer {...fileExplorerProps} />
    </Modal>
  );
};

export default CreateProjectModal;
