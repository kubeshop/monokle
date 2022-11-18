import {useState} from 'react';

import {Form, Input, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import {cloneDeep} from 'lodash';
import {v4 as uuid} from 'uuid';

import {SavedCommand} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateProjectConfig} from '@redux/reducers/appConfig';

type IProps = {
  isOpen: boolean;
  onCancel: () => void;
  command?: SavedCommand;
};

const SaveEditModal: React.FC<IProps> = props => {
  const {isOpen, command, onCancel} = props;

  const dispatch = useAppDispatch();
  const savedCommandMap = useAppSelector(state => state.config.projectConfig?.savedCommandMap || {});

  const [isLoading, setIsLoading] = useState(false);
  const [form] = useForm();

  const onOkHandler = () => {
    form.validateFields().then(values => {
      setIsLoading(true);

      const {label, content} = values;
      const updatedSavedCommandMap = cloneDeep(savedCommandMap);

      // editing command
      if (command) {
        console.log('Update...');
      } else {
        const newCommandId = uuid();
        updatedSavedCommandMap[newCommandId] = {
          id: newCommandId,
          label,
          content,
        };

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
        onCancel();
      }
    });
  };

  return (
    <Modal
      title="Save command"
      open={isOpen}
      okText="Save"
      onOk={onOkHandler}
      onCancel={onCancel}
      confirmLoading={isLoading}
      width={800}
    >
      <Form form={form} layout="vertical">
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
  );
};

export default SaveEditModal;
