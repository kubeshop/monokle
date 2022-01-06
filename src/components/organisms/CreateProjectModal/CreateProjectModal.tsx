import {useEffect, useState} from 'react';

import {Button, Form, Input, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import {QuestionCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setCreateProject} from '@redux/reducers/appConfig';
import {closeCreateProjectModal} from '@redux/reducers/ui';

import FileExplorer from '@components/atoms/FileExplorer';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {useFocus} from '@utils/hooks';

import Colors from '@styles/Colors';

const CreateProjectModal: React.FC = () => {
  const uiState = useAppSelector(state => state.ui.createProjectModal);
  const dispatch = useAppDispatch();
  const [createProjectForm] = useForm();
  const [inputRef, focus] = useFocus<any>();
  const [formStep, setFormStep] = useState(1);
  const [formValues, setFormValues] = useState({projectName: '', location: ''});

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (folderPath) {
        createProjectForm.setFieldsValue({location: folderPath});
      }
    },
    {isDirectoryExplorer: true}
  );

  const onFinish = (values: {projectName: string; location: string}) => {
    setFormValues(values);
    if (uiState.fromTemplate && formStep === 1) {
      setFormStep(2);
    }
  };

  useEffect(() => {
    if (!uiState.fromTemplate && formValues.location && formValues.projectName) {
      dispatch(setCreateProject({rootFolder: formValues.location, name: formValues.projectName}));
      closeModal();
    }
  }, [formValues]);

  useEffect(() => {
    if (uiState.isOpen) {
      focus();
    } else {
      createProjectForm.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiState]);

  const closeModal = () => {
    setFormValues({projectName: '', location: ''});
    createProjectForm.resetFields();
    setFormStep(1);
    dispatch(closeCreateProjectModal());
  };

  if (!uiState.isOpen) {
    return null;
  }

  return (
    <Modal
      title={
        uiState.fromTemplate ? (
          <div>
            <div style={{color: `${Colors.grey800}`, fontSize: '10px'}}>Step {formStep} of 2</div>
            <div>Create a Project</div>
          </div>
        ) : (
          <div>Create a Project</div>
        )
      }
      visible={uiState?.isOpen}
      onCancel={closeModal}
      footer={[
        <Button key="cancel" onClick={closeModal}>
          Discard
        </Button>,
        uiState.fromTemplate && formStep === 2 && (
          <Button key="back" onClick={() => setFormStep(1)}>
            Back
          </Button>
        ),
        <Button key="submit" type="primary" onClick={() => createProjectForm.submit()}>
          {uiState.fromTemplate && formStep === 1 ? 'Next: Select a Template' : 'Create Project'}
        </Button>,
      ]}
    >
      <Form
        layout="vertical"
        form={createProjectForm}
        onFinish={onFinish}
        initialValues={formValues}
        style={{display: formStep === 1 ? 'block' : 'none'}}
      >
        <Form.Item
          name="projectName"
          label="Project Name"
          required
          tooltip="The name of your project throughout Monokle. Default is the name of your selected folder."
        >
          <Input ref={inputRef} />
        </Form.Item>
        <Form.Item label="Location" required tooltip="The local path where your project will live.">
          <Input.Group compact>
            <Form.Item name="location" noStyle>
              <Input required style={{width: 'calc(100% - 100px)'}} />
            </Form.Item>
            <Button style={{width: '100px'}} onClick={openFileExplorer}>
              Browse
            </Button>
          </Input.Group>
        </Form.Item>
      </Form>

      <div style={{display: formStep === 2 ? 'block' : 'none'}}>[TEMPLATE EXPLORER GOES HERE]</div>
      <FileExplorer {...fileExplorerProps} />
    </Modal>
  );
};

export default CreateProjectModal;
