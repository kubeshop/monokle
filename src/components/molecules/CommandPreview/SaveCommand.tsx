import {useState} from 'react';

import {Button, Input, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import {v4 as uuid} from 'uuid';

import {SavedCommand} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateProjectConfig} from '@redux/reducers/appConfig';

import {Form} from '@components/organisms/TerminalPane/TerminalOptions.styled';

const SaveCommand = () => {
  const dispatch = useAppDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form] = useForm();

  const savedCommandMap = useAppSelector(state => state.config.projectConfig?.savedCommandMap || {});

  const onOkHandler = () => {
    form.submit();
  };

  const onSaveCommand = async () => {
    setIsLoading(true);

    const values: {label: string; content: string} = await form.validateFields();
    const {label, content} = values;

    const updatedSavedCommandMap: Record<string, SavedCommand> = JSON.parse(JSON.stringify(savedCommandMap));
    const newCommandId = uuid();
    updatedSavedCommandMap[newCommandId] = {
      id: newCommandId,
      label,
      content,
    };

    // TODO: why aren't the commands persisted between reloads?
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
    setIsModalOpen(false);
  };
  return (
    <>
      <Modal
        title="Save command"
        open={isModalOpen}
        okText="Save"
        onOk={onOkHandler}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={isLoading}
      >
        <Form form={form} onFinish={onSaveCommand}>
          <Form.Item
            name="label"
            label="Label"
            rules={[{required: true, message: 'Please provide a label for the command.'}]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="content" label="Command" rules={[{required: true, message: 'Please provide a command.'}]}>
            <Input.TextArea
              autoSize
              placeholder="Write your shell command here. The command should have YAML output containing k8s resources."
            />
          </Form.Item>
        </Form>
      </Modal>
      <Button type="link" onClick={() => setIsModalOpen(true)}>
        Save command
      </Button>
    </>
  );
};

export default SaveCommand;
