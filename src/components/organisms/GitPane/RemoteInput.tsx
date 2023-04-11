import {useState} from 'react';

import {Button, Form, Input} from 'antd';
import {useForm} from 'antd/es/form/Form';

import {CheckOutlined} from '@ant-design/icons';

import {updateRemoteRepo} from '@redux/git';
import {setRemote} from '@redux/git/service';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {showGitErrorModal} from '@utils/terminal';

import * as S from './RemoteInput.styled';

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
    <S.RemoteInputContainer>
      <S.RemoteInputInfo>To publish your branch to a remote origin:</S.RemoteInputInfo>
      <Form form={form} layout="vertical">
        <S.RemoteInputFlex>
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
        </S.RemoteInputFlex>
      </Form>
    </S.RemoteInputContainer>
  );
};

export default RemoteInput;
