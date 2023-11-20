import {useState} from 'react';

import {Button, Form, Input} from 'antd';
import {useForm} from 'antd/es/form/Form';

import {CheckOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {updateRemoteRepo} from '@redux/git';
import {setRemote} from '@redux/git/git.ipc';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {showGitErrorModal} from '@utils/terminal';

import {Colors} from '@shared/styles/colors';

const RemoteInput: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder) || '';

  const [loading, setLoading] = useState(false);

  const [form] = useForm();

  const handleAddRemote = () => {
    setLoading(true);

    form.validateFields().then(async values => {
      try {
        await setRemote({localPath: selectedProjectRootFolder, remoteURL: values.remoteURL});
        dispatch(updateRemoteRepo({exists: true, authRequired: false}));
      } catch (e: any) {
        showGitErrorModal('Setting remote failed', e.message);
      }

      form.resetFields();
    });

    setLoading(false);
  };

  return (
    <Box>
      <Description>To publish your branch to a remote origin:</Description>
      <Form form={form} layout="vertical">
        <RemoteInputFlex>
          <Form.Item
            name="remoteURL"
            required
            style={{width: '100%'}}
            rules={[
              {
                required: true,
                message: 'Please provide your remote URL!',
              },
            ]}
          >
            <Input placeholder="Remote URL (eg. https://github.com/kubeshop/monokle)" />
          </Form.Item>

          <Button loading={loading} type="primary" onClick={handleAddRemote}>
            <CheckOutlined />
          </Button>
        </RemoteInputFlex>
      </Form>
    </Box>
  );
};

export default RemoteInput;

const Box = styled.div`
  margin: 14px;
  color: ${Colors.grey9};
`;

const RemoteInputFlex = styled.div`
  display: flex;
  gap: 10px;

  .ant-form-item {
    margin-bottom: 0px;
  }
`;

const Description = styled.div`
  margin-bottom: 12px;
`;
