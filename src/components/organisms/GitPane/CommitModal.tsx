import {useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import {Form, Input, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import {setCommitsCount} from '@redux/git';
import {getAheadBehindCommitsCount} from '@redux/git/service';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';

import {promiseFromIpcRenderer} from '@utils/promises';
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
  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder);

  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form] = useForm();

  const onOkHandler = () => {
    form.submit();
  };

  const commitHandler = async () => {
    if (!selectedProjectRootFolder || !currentBranch) {
      return;
    }

    setCommitLoading(true);
    setLoading(true);

    form.validateFields().then(async values => {
      const result = await promiseFromIpcRenderer('git.commitChanges', 'git.commitChanges.result', {
        localPath: selectedProjectRootFolder,
        message: values.message,
      });

      if (result.error) {
        showGitErrorModal('Commit failed', `git commit -m "${values.message}"`, dispatch);
      } else {
        dispatch(setAlert({title: 'Committed successfully', message: '', type: AlertEnum.Success}));

        try {
          const {aheadCount, behindCount} = await getAheadBehindCommitsCount({
            localPath: selectedProjectRootFolder,
            currentBranch,
          });
          dispatch(setCommitsCount({aheadCount, behindCount}));
        } catch (e) {
          dispatch(setCommitsCount({aheadCount: 0, behindCount: 0}));
        }
      }

      form.resetFields();
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
