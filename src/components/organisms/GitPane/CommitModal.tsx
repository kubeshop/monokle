import {useState} from 'react';

import {Form, Input, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import {useAppSelector} from '@redux/hooks';

import {promiseFromIpcRenderer} from '@utils/promises';

type IProps = {
  visible: boolean;
  setShowModal: (value: boolean) => void;
};

const CommitModal: React.FC<IProps> = props => {
  const {visible, setShowModal} = props;

  const currentBranch = useAppSelector(state => state.git.repo?.currentBranch);
  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder);

  const [loading, setLoading] = useState(false);

  const [form] = useForm();

  const onOkHandler = () => {
    form.submit();
  };

  const commitHandler = async () => {
    setLoading(true);

    form.validateFields().then(async values => {
      await promiseFromIpcRenderer('git.commitChanges', 'git.commitChanges.result', {
        localPath: selectedProjectRootFolder,
        message: values.message,
      });

      form.resetFields();
    });

    setLoading(false);
    setShowModal(false);
  };

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
          noStyle
          name="message"
          required
          rules={[
            {
              required: true,
              message: 'Please provide your commit message!',
            },
          ]}
        >
          <Input.TextArea autoSize placeholder="Message" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CommitModal;
