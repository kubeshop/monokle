import {useEffect, useState} from 'react';

import {Button, Form, Input, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import {QuestionCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeCreateProjectModal} from '@redux/reducers/ui';

import {useFocus} from '@utils/hooks';

import Colors from '@styles/Colors';

const StyledQuestionCircleOutlined = styled(QuestionCircleOutlined)`
  color: ${Colors.grey7};
  margin: 0 6px;
`;

type FieldLabelProps = {
  title: string;
};

const CreateProjectModal: React.FC = () => {
  const uiState = useAppSelector(state => state.ui.createProjectModal);
  const dispatch = useAppDispatch();
  const [createProjectForm] = useForm();
  const [inputRef, focus] = useFocus<any>();
  const [formStep, setFormStep] = useState(1);
  const [formValues, setFormValues] = useState({projectName: 'sdfgsdfg', location: ''});

  const onFinish = (values: {projectName: string; location: string}) => {
    setFormValues(values);
    if (uiState.fromTemplate && formStep === 1) {
      setFormStep(2);
    } else {
      console.log('formValues', formValues);
    }
  };

  useEffect(() => {
    if (uiState.isOpen) {
      focus();
    } else {
      createProjectForm.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiState]);

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
      onCancel={() => {
        setFormStep(1);
        dispatch(closeCreateProjectModal());
      }}
      footer={[
        <Button
          key="cancel"
          onClick={() => {
            setFormStep(1);
            dispatch(closeCreateProjectModal());
          }}
        >
          Discard
        </Button>,
        uiState.fromTemplate && formStep === 2 && (
          <Button key="back" onClick={() => setFormStep(1)}>
            Back
          </Button>
        ),
        <Button
          key="submit"
          type="primary"
          onClick={() => {
            if (uiState.fromTemplate && formStep === 2) {
              console.log('formValues', formValues);
            } else {
              createProjectForm.submit();
            }
          }}
        >
          {uiState.fromTemplate && formStep === 1 ? 'Next: Select a Template' : 'Create Project'}
        </Button>,
      ]}
    >
      {formStep === 1 && (
        <Form layout="vertical" form={createProjectForm} initialValues={formValues} onFinish={onFinish}>
          <Form.Item
            name="projectName"
            label="Project Name"
            required
            tooltip="The name of your project throughout Monokle. Default is the name of your selected folder."
          >
            <Input ref={inputRef} />
          </Form.Item>
          <Form.Item name="location" label="Location" required tooltip="The local path where your project will live.">
            <Input />
          </Form.Item>
        </Form>
      )}

      {formStep === 2 && <div>[TEMPLATE EXPLORER GOES HERE]</div>}
    </Modal>
  );
};

export default CreateProjectModal;
