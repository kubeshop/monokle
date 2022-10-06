import {Button, Form, Input, Modal} from 'antd';

import {DEFAULT_GIT_REPO_PLACEHOLDER} from '@constants/constants';

import {closeGitCloneModal} from '@redux/git';
import {useAppDispatch} from '@redux/hooks';

const GitCloneModal: React.FC = () => {
  const dispatch = useAppDispatch();

  const onCancel = () => {
    dispatch(closeGitCloneModal());
  };

  return (
    <Modal open onCancel={onCancel}>
      <Form layout="vertical">
        <Form.Item
          name="repoURL"
          label="Repository URL"
          rules={[
            {
              required: true,
              message: 'Please provide your project repository URL!',
            },
          ]}
        >
          <Input placeholder={DEFAULT_GIT_REPO_PLACEHOLDER} />
        </Form.Item>
        <Form.Item label="Location">
          <Input.Group compact>
            <Form.Item name="localPath">
              <Input style={{width: 'calc(100% - 100px)'}} />
            </Form.Item>
            <Button style={{width: '100px'}}>Browse</Button>
          </Input.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default GitCloneModal;
