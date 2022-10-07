import {Button, Form, Input, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import {sep} from 'path';

import {DEFAULT_GIT_REPO_PLACEHOLDER, VALID_URL_REGEX} from '@constants/constants';

import {closeGitCloneModal} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {FileExplorer} from '@atoms';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {doesPathExist} from '@utils/files';

const GitCloneModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const projectsRootPath = useAppSelector(state => state.config.projectsRootPath);

  const [form] = useForm();

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (folderPath) {
        form.setFieldValue('localPath', folderPath);
      }
    },
    {isDirectoryExplorer: true}
  );

  const onCancel = () => {
    dispatch(closeGitCloneModal());
  };

  const onOk = () => {
    form.validateFields().then(values => {
      console.log(values);
    });
  };

  return (
    <Modal open onCancel={onCancel} onOk={onOk}>
      <Form form={form} initialValues={{repoURL: '', localPath: projectsRootPath}} layout="vertical">
        <Form.Item
          name="repoURL"
          label="Repository URL"
          rules={[
            {
              pattern: VALID_URL_REGEX,
              message: 'Please provide a valid URL!',
            },
            {
              required: true,
              message: 'Please provide your project repository URL!',
            },
          ]}
        >
          <Input placeholder={DEFAULT_GIT_REPO_PLACEHOLDER} />
        </Form.Item>

        <Form.Item label="Location" required>
          <Input.Group compact>
            <Form.Item
              name="localPath"
              noStyle
              rules={[
                ({getFieldValue}) => ({
                  validator: () => {
                    return new Promise((resolve: (value?: any) => void, reject) => {
                      const localPath = getFieldValue('localPath');

                      const repoName = getFieldValue('repoURL').split('/').pop();

                      if (!localPath) {
                        reject(new Error('Please provide your local path!'));
                        return;
                      }

                      if (repoName && doesPathExist(`${localPath}${sep}${repoName}`)) {
                        reject(new Error(`'${repoName}' folder already exists! Please provide another local path!'`));
                        return;
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

export default GitCloneModal;
