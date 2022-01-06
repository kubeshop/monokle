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

const FieldLabel: React.FC<FieldLabelProps> = ({title}) => {
  return (
    <div
      style={{
        width: '240px',
        fontSize: '16px',
        lineHeight: '24px',
        color: `${Colors.grey700}`,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <span style={{color: `${Colors.red7}`, marginRight: '4px'}}>*</span>
      <span>{title}</span>
      <StyledQuestionCircleOutlined />
      <span>:</span>
    </div>
  );
};

const CreateProjectModal: React.FC = () => {
  const uiState = useAppSelector(state => state.ui.createProjectModal);
  const dispatch = useAppDispatch();
  const [createProjectForm] = useForm();
  const [inputRef, focus] = useFocus<any>();
  const [formStep, setFormStep] = useState(1);

  const onFinish = (values: {projectName: string; location: string}) => {
    const {projectName, location} = values;
    console.log('values', projectName, location);
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
        dispatch(closeCreateProjectModal());
      }}
      footer={[
        <Button
          key="cancel"
          onClick={() => {
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
            if (uiState.fromTemplate && formStep === 1) {
              setFormStep(2);
            } else {
              createProjectForm.submit();
            }
          }}
        >
          {uiState.fromTemplate ? 'Next: Select a Template' : 'Create Project'}
        </Button>,
      ]}
    >
      {formStep === 1 && (
        <Form layout="vertical" form={createProjectForm} initialValues={{projectName: ''}} onFinish={onFinish}>
          <Form.Item
            name="projectName"
            rules={[
              ({getFieldValue}) => ({
                validator: () => {
                  return new Promise((resolve: (value?: any) => void, reject) => {
                    const projectNameValue: string = getFieldValue('projectName');

                    if (!projectNameValue) {
                      reject(new Error("This field can't be empty"));
                    }

                    resolve();
                  });
                },
              }),
            ]}
          >
            <div style={{display: 'flex'}}>
              <FieldLabel title="Project Name" />
              <Input ref={inputRef} />
            </div>
          </Form.Item>
          <Form.Item
            name="location"
            rules={[
              ({getFieldValue}) => ({
                validator: () => {
                  return new Promise((resolve: (value?: any) => void, reject) => {
                    const locationValue: string = getFieldValue('location');

                    if (!locationValue) {
                      reject(new Error("This field can't be empty"));
                    }

                    resolve();
                  });
                },
              }),
            ]}
          >
            <div style={{display: 'flex'}}>
              <FieldLabel title="Location" />
              <Input />
            </div>
          </Form.Item>
        </Form>
      )}

      {formStep === 2 && <div>[TEMPLATE EXPLORER GOES HERE]</div>}
    </Modal>
  );
};

export default CreateProjectModal;
