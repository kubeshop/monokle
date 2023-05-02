import {useState} from 'react';

import {Button, Form, Input, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import fs from 'fs';
import {rm} from 'fs/promises';
import {sep} from 'path';
import styled from 'styled-components';

import {DEFAULT_GIT_REPO_PLACEHOLDER, VALID_URL_REGEX} from '@constants/constants';

import {setCreateProject} from '@redux/appConfig';
import {closeGitCloneModal} from '@redux/git';
import {cloneGitRepo} from '@redux/git/git.ipc';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {FileExplorer} from '@atoms';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {doesPathExist} from '@utils/files';

const GitCloneModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const projectsRootPath = useAppSelector(state => state.config.projectsRootPath);

  const [loading, setLoading] = useState(false);

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
    if (!loading) {
      dispatch(closeGitCloneModal());
    }
  };

  const onOk = () => {
    form.validateFields().then(async values => {
      setLoading(true);

      const {localPath, repoURL} = values;
      const repoName = repoURL.split('/').pop();
      const localGitPath = `${localPath}${sep}${repoName.replace('.git', '')}`;

      if (!doesPathExist(localPath)) {
        fs.mkdirSync(localPath, {recursive: true});
      }

      try {
        await cloneGitRepo({localPath: localGitPath, repoPath: repoURL});
        setLoading(false);
        dispatch(closeGitCloneModal());
        dispatch(setCreateProject({rootFolder: `${localPath}${sep}${repoName.replace('.git', '')}`}));
      } catch (error: any) {
        setLoading(false);
        dispatch(closeGitCloneModal());

        Modal.warning({
          title: 'Clone failed!',
          content: <div>{error.message}</div>,
          zIndex: 100000,
        });

        if (doesPathExist(localGitPath)) {
          rm(localGitPath, {recursive: true});
        }
      }
    });
  };

  return (
    <Modal open confirmLoading={loading} onCancel={onCancel} onOk={onOk}>
      <Form form={form} initialValues={{repoURL: '', localPath: projectsRootPath}} layout="vertical">
        <Form.Item
          style={{marginBottom: '0px'}}
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
          <Input
            onKeyDown={e => {
              if (form.getFieldValue('repoURL')) {
                return;
              }

              if (e.key === 'Tab') {
                e.preventDefault();
                form.setFieldValue('repoURL', DEFAULT_GIT_REPO_PLACEHOLDER);
                form.validateFields();
              }
            }}
            placeholder={DEFAULT_GIT_REPO_PLACEHOLDER}
          />
        </Form.Item>

        <SampleButton
          type="link"
          onClick={() => {
            form.setFieldValue('repoURL', DEFAULT_GIT_REPO_PLACEHOLDER);
            onOk();
          }}
        >
          Use Monokle Sample Repo
        </SampleButton>

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
                        reject(
                          new Error(
                            `'${repoName}' already exists inside this directory! Please provide another local path!`
                          )
                        );
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

// Styled Components

const SampleButton = styled(Button)`
  padding: 4px 0px 4px 0px;
  margin: 8px 0px;
`;
