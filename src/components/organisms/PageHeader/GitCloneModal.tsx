import {useEffect, useState} from 'react';

import {Button, Form, Input, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import _ from 'lodash';

import {DEFAULT_GIT_REPO_PLACEHOLDER} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setCreateProject} from '@redux/reducers/appConfig';

import {FileExplorer} from '@components/atoms';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {isEmptyDir} from '@utils/files';
import {promiseFromIpcRenderer} from '@utils/promises';

type Props = {
  onCancel?: () => void;
  onComplete?: () => void;
};

const GitCloneModal = (props: Props) => {
  const {onComplete, onCancel} = props;
  const dispatch = useAppDispatch();
  const projectsRootPath = useAppSelector(state => state.config.projectsRootPath);
  const [isCloning, setIsCloning] = useState<boolean>(false);
  const [gitForm] = useForm();
  const [isEditingRootPath, setIsEditingRoothPath] = useState(false);
  const [pickedPath, setPickedPath] = useState(projectsRootPath);
  const [formValues, setFormValues] = useState({repoPath: '', localPath: pickedPath});

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (folderPath) {
        setPickedPath(folderPath);
        setFormValues({...formValues});
        setIsEditingRoothPath(false);
        gitForm.validateFields();
      }
    },
    {isDirectoryExplorer: true}
  );

  const onOk = async () => {
    await gitForm.validateFields();

    // if (!formValues.repoPath || (!formValues.localPath && !pickedPath)) return;

    setIsCloning(true);
    promiseFromIpcRenderer('git.cloneGitRepo', 'git.cloneGitRepo.result', {
      localPath: pickedPath,
      repoPath: formValues.repoPath,
    }).then(() => {
      setIsCloning(false);
      dispatch(setCreateProject({rootFolder: pickedPath}));
      onComplete && onComplete();
    });
  };

  const setProjectPath = () => {
    const projectPath = pickedPath;

    gitForm.setFields([
      {
        name: 'localPath',
        value: projectPath,
      },
    ]);
  };

  useEffect(() => {
    setFormValues({...formValues, localPath: projectsRootPath});
    setIsEditingRoothPath(false);
    setPickedPath(projectsRootPath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsRootPath]);

  useEffect(() => {
    setProjectPath();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedPath, formValues, isEditingRootPath]);

  return (
    <Modal visible onOk={onOk} confirmLoading={isCloning} onCancel={onCancel}>
      <Form
        layout="vertical"
        form={gitForm}
        initialValues={formValues}
        onFieldsChange={field => {
          const repoPath = field.filter(item => _.includes(item.name.toString(), 'repoPath'));
          if (repoPath && repoPath.length > 0) {
            setFormValues({...formValues, repoPath: repoPath[0].value});
            setIsEditingRoothPath(false);
          }
          const localPath = field.filter(item => _.includes(item.name.toString(), 'localPath'));
          if (localPath && localPath.length > 0) {
            setPickedPath(localPath[0].value);
            setFormValues({...formValues, localPath: localPath[0].value});
            setIsEditingRoothPath(true);
          }
        }}
      >
        <Form.Item
          name="repoPath"
          label="Repository URL"
          required
          tooltip="The Git path of your project"
          rules={[
            {
              required: true,
              message: 'Please provide your project git path!',
            },
          ]}
        >
          <Input placeholder={DEFAULT_GIT_REPO_PLACEHOLDER} />
        </Form.Item>

        <Form.Item label="Location" required tooltip="The local path where your project will live.">
          <Input.Group compact>
            <Form.Item
              name="localPath"
              noStyle
              rules={[
                {
                  required: true,
                  message: 'Please provide your local path!',
                },
                ({getFieldValue}) => ({
                  validator: () => {
                    return new Promise((resolve: (value?: any) => void, reject) => {
                      const emptyDir = isEmptyDir(getFieldValue('localPath'));

                      if (!emptyDir) {
                        reject(new Error('Folder contains files! Please provide a path to empty folder'));
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
        <FileExplorer {...fileExplorerProps} />
      </Form>
    </Modal>
  );
};

export default GitCloneModal;
