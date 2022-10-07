import {Button, Form, Input, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import {DEFAULT_GIT_REPO_PLACEHOLDER} from '@constants/constants';

import {closeGitCloneModal} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {FileExplorer} from '@atoms';

import {useFileExplorer} from '@hooks/useFileExplorer';

const GitCloneModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const projectsRootPath = useAppSelector(state => state.config.projectsRootPath);

  const [form] = useForm();

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (folderPath) {
        form.setFieldValue('location', folderPath);
      }
    },
    {isDirectoryExplorer: true}
  );

  const onCancel = () => {
    dispatch(closeGitCloneModal());
  };

  return (
    <Modal open onCancel={onCancel}>
      <Form form={form} initialValues={{repoURL: '', location: projectsRootPath}} layout="vertical">
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
            <Form.Item name="location" noStyle>
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

export default GitCloneModal;
