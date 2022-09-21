import {useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import {Form, Input, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import {useAppSelector} from '@redux/hooks';

import {promiseFromIpcRenderer} from '@utils/promises';

type IProps = {
  visible: boolean;
  setCommitLoading: (value: boolean) => void;
  setShowModal: (value: boolean) => void;
};

const CommitModal: React.FC<IProps> = props => {
  const {visible, setCommitLoading, setShowModal} = props;

  const currentBranch = useAppSelector(state => state.git.repo?.currentBranch);
  const osPlatform = useAppSelector(state => state.config.osPlatform);
  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder);

  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form] = useForm();

  const onOkHandler = () => {
    form.submit();
  };

  const commitHandler = async () => {
    setCommitLoading(true);
    setLoading(true);

    form.validateFields().then(async values => {
      await promiseFromIpcRenderer('git.commitChanges', 'git.commitChanges.result', {
        localPath: selectedProjectRootFolder,
        message: values.message,
      });

      form.resetFields();
    });

    setLoading(false);
    setCommitLoading(false);
    setShowModal(false);
  };

  useHotkeys(
    'ctrl+enter, command+enter',
    () => {
      if (!isFocused) {
        return;
      }

      commitHandler();
    },
    {enableOnTags: ['TEXTAREA']},
    [isFocused]
  );

  return (
    <Modal
      title={`Commit to ${currentBranch || 'main'}`}
      okText="Commit"
      visible={visible}
      onCancel={() => setShowModal(false)}
      onOk={onOkHandler}
      confirmLoading={loading}
    >
      <Form layout="vertical" form={form} onFinish={commitHandler}>
        <Form.Item
          name="message"
          required
          style={{marginBottom: '0px'}}
          rules={[
            {
              required: true,
              message: 'Please provide your commit message!',
            },
          ]}
        >
          <Input.TextArea
            onBlur={() => setIsFocused(false)}
            onFocus={() => setIsFocused(true)}
            autoSize
            placeholder={`Message (${osPlatform === 'darwin' ? 'Cmd' : 'Ctrl'} + Enter to commit)`}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CommitModal;
