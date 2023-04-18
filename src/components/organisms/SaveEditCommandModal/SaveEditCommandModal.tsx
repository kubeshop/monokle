import {useEffect, useState} from 'react';

import {Form, Input, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import {cloneDeep} from 'lodash';
import {v4 as uuid} from 'uuid';

import {updateProjectConfig} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {closeSaveEditCommandModal} from '@redux/reducers/ui';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AlertEnum} from '@shared/models/alert';

const SaveEditCommandModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const rootFolderPath = useAppSelector(state => state.main.fileMap[ROOT_FILE_ENTRY].filePath);
  const savedCommandMap = useAppSelector(state => state.config.projectConfig?.savedCommandMap || {});
  const {isOpen, command} = useAppSelector(state => state.ui.saveEditCommandModal);

  const [isLoading, setIsLoading] = useState(false);
  const [form] = useForm();

  const onOkHandler = () => {
    form.validateFields().then(values => {
      setIsLoading(true);

      const {label, content} = values;
      const updatedSavedCommandMap = cloneDeep(savedCommandMap);

      // editing command
      if (command) {
        updatedSavedCommandMap[command.id] = {id: command.id, label, content};
      } else {
        const newCommandId = uuid();
        updatedSavedCommandMap[newCommandId] = {
          id: newCommandId,
          label,
          content,
        };
      }

      dispatch(
        updateProjectConfig({
          config: {
            savedCommandMap: updatedSavedCommandMap,
          },
          fromConfigFile: false,
        })
      );
      form.resetFields();

      setIsLoading(false);
      dispatch(closeSaveEditCommandModal());

      dispatch(
        setAlert({
          title: `Command ${label} ${command ? 'updated' : 'saved'} successfully`,
          message: '',
          type: AlertEnum.Success,
        })
      );
    });
  };

  useEffect(() => {
    if (command) {
      form.setFieldsValue({label: command.label, content: command.content});
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal
      title={`${command ? 'Edit' : 'Save'} command`}
      open={isOpen}
      okText={command ? 'Update' : 'Save'}
      onOk={onOkHandler}
      onCancel={() => dispatch(closeSaveEditCommandModal())}
      confirmLoading={isLoading}
      width={800}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="label"
          label="Label"
          rules={[
            ({getFieldValue}) => ({
              validator: () => {
                return new Promise((resolve: (value?: any) => void, reject) => {
                  const label: string = getFieldValue('label');

                  if (!label) {
                    reject(new Error('Please provide a label'));
                  }

                  if (Object.values(savedCommandMap).find(c => c?.label === label)) {
                    reject(new Error('This label is already used for another command'));
                  }

                  resolve();
                });
              },
            }),
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="content" label="Command" rules={[{required: true, message: 'Please provide a command'}]}>
          <Input.TextArea
            autoSize
            placeholder="Write your shell command here. The command should have YAML output containing k8s resources."
          />
        </Form.Item>
      </Form>
      <p>Current working directory: {rootFolderPath}</p>
    </Modal>
  );
};

export default SaveEditCommandModal;
