import {useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import {Form, Input, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import {setCommitsCount} from '@redux/git';
import {commitChanges, getAheadBehindCommitsCount} from '@redux/git/git.ipc';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';

import {showGitErrorModal} from '@utils/terminal';

import {AlertEnum} from '@shared/models/alert';

type IProps = {
  visible: boolean;
  setCommitLoading: (value: boolean) => void;
  setShowModal: (value: boolean) => void;
};

const CommitModal: React.FC<IProps> = props => {
  const {visible, setCommitLoading, setShowModal} = props;

  const dispatch = useAppDispatch();
  const currentBranch = useAppSelector(state => state.git.repo?.currentBranch);
  const osPlatform = useAppSelector(state => state.config.osPlatform);
  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder) || '';

  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form] = useForm();

  const onOkHandler = () => {
    form.submit();
  };

  const commitHandler = async () => {
    if (!currentBranch) {
      return;
    }

    setCommitLoading(true);
    setLoading(true);

    form.validateFields().then(async values => {
      try {
        await commitChanges({localPath: selectedProjectRootFolder, message: values.message});
        dispatch(setAlert({title: 'Committed successfully', message: '', type: AlertEnum.Success}));
        form.resetFields();
      } catch (e) {
        showGitErrorModal('Commit failed', undefined, `git commit -m "${values.message}"`, dispatch);
        form.resetFields();
        return;
      }

      try {
        const {aheadCount, behindCount} = await getAheadBehindCommitsCount({
          localPath: selectedProjectRootFolder,
          branchName: currentBranch,
        });
        dispatch(setCommitsCount({aheadCount, behindCount}));
      } catch (e) {
        dispatch(setCommitsCount({aheadCount: 0, behindCount: 0}));
      }
    });

    setLoading(false);
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
    {enableOnFormTags: ['TEXTAREA']},
    [isFocused]
  );

  return (
    <Modal
      title={`Commit to ${currentBranch || 'main'}`}
      okText="Commit"
      open={visible}
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
            autoFocus
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
