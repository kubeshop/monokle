import {useRef} from 'react';

import {Button, Form, Input, Modal} from 'antd';
import {FormProps, useForm} from 'antd/lib/form/Form';

import {existsSync} from 'fs';
import {includes, isEmpty} from 'lodash';
import path from 'path';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeCreateProjectModal, openTemplateExplorer, setTemplateProjectCreate} from '@redux/reducers/ui';
import {setCreateProject} from '@redux/thunks/project';

import {FileExplorer} from '@atoms';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {trackEvent} from '@shared/utils/telemetry';

const CreateProjectModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const projectsRootPath = useAppSelector(state => state.config.projectsRootPath);
  const uiState = useAppSelector(state => state.ui.createProjectModal);

  const [createProjectForm] = useForm();
  const pickedPath = useRef(projectsRootPath);

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (folderPath) {
        createProjectForm.setFieldsValue({rootFolder: folderPath});
        pickedPath.current = folderPath;
      }
    },
    {isDirectoryExplorer: true}
  );

  const onCloseModalHandler = () => {
    createProjectForm.resetFields();
    dispatch(closeCreateProjectModal());
  };

  const onSubmitHandler = () => {
    createProjectForm.validateFields().then(values => {
      const {rootFolder, name} = values;

      if (!uiState.fromTemplate) {
        trackEvent('app_start/create_project', {from: 'scratch'});
        dispatch(setCreateProject({name, rootFolder}));
        onCloseModalHandler();
      } else {
        trackEvent('app_start/create_project', {from: 'folder'});
        dispatch(setTemplateProjectCreate({name, rootFolder}));
        dispatch(openTemplateExplorer());
        onCloseModalHandler();
      }
    });
  };

  const onFieldsChangeHandler = (changedFields: FormProps['fields']) => {
    if (!changedFields) {
      return;
    }

    const name = changedFields.filter((field: any) => includes(field.name.toString(), 'name'));

    if (isEmpty(name)) {
      pickedPath.current = changedFields[0].value;
      return;
    }

    const nameValue = name[0].value;

    const projectPath = nameValue
      ? path.join(pickedPath.current, nameValue.toLowerCase().replaceAll(' ', '-'))
      : pickedPath.current;

    createProjectForm.setFieldsValue({rootFolder: projectPath});
  };

  if (!uiState.isOpen) {
    return null;
  }

  return (
    <Modal
      open={uiState.isOpen}
      footer={
        <>
          <Button key="cancel" onClick={onCloseModalHandler}>
            Cancel
          </Button>

          <Button id="empty-project-save" key="submit" type="primary" onClick={onSubmitHandler}>
            {uiState.fromTemplate ? 'Next: Select a Template' : 'Create Project'}
          </Button>
        </>
      }
    >
      <Form
        onFieldsChange={onFieldsChangeHandler}
        layout="vertical"
        form={createProjectForm}
        initialValues={{name: '', rootFolder: projectsRootPath}}
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
          <Input />
        </Form.Item>

        <Form.Item label="Location" required tooltip="The local path where your project will live.">
          <Input.Group compact>
            <Form.Item
              name="rootFolder"
              noStyle
              rules={[
                ({getFieldValue}) => ({
                  validator: () => {
                    return new Promise((resolve: (value?: any) => void, reject) => {
                      const rootFolder: string = getFieldValue('rootFolder').toLowerCase();

                      if (!rootFolder) {
                        reject(new Error('Please provide your project path!'));
                      }

                      if (existsSync(rootFolder)) {
                        reject(new Error('Path exists!'));
                      }

                      resolve();
                    });
                  },
                }),
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
