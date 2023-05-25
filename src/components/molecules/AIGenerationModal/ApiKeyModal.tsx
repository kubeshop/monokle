import {useState} from 'react';

import {Button, Input, Modal} from 'antd';

import {KeyOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {setUserApiKey} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';

import {AlertEnum} from '@shared/models/alert';
import {Colors} from '@shared/styles';
import {openUrlInExternalBrowser} from '@shared/utils';

type ApiKeyModalProps = {
  isVisible: boolean;
  onClose: () => void;
};

const OPEN_AI_API_KEY_URL = 'https://platform.openai.com/account/api-keys';

const ApiKeyModal = (props: ApiKeyModalProps) => {
  const {isVisible, onClose} = props;
  const dispatch = useAppDispatch();
  const apiKey = useAppSelector(state => state.config.userApiKeys.OpenAI);
  const [inputApiKey, setInputApiKey] = useState(apiKey);

  const onSubmit = () => {
    if (!inputApiKey) {
      return;
    }
    dispatch(setUserApiKey({vendor: 'OpenAI', apiKey: inputApiKey}));
    dispatch(
      setAlert({
        title: 'API key submitted',
        type: AlertEnum.Success,
        message: 'Your can now use the AI features.',
      })
    );
    onClose();
  };

  return (
    <Modal
      centered
      open={isVisible}
      onCancel={onClose}
      onOk={onSubmit}
      title={
        <>
          <KeyIcon />
          <span>Submit API key from OpenAI</span>
        </>
      }
      okText="Submit"
      okButtonProps={{disabled: !inputApiKey}}
    >
      <p>
        Please enter your OpenAI API key. You can find it{' '}
        <Button
          type="link"
          style={{padding: 0}}
          onClick={() => {
            openUrlInExternalBrowser(OPEN_AI_API_KEY_URL);
          }}
        >
          here
        </Button>
        .<Strong>You only have to do this once.</Strong>
      </p>
      <Input value={inputApiKey} onChange={e => setInputApiKey(e.target.value)} placeholder="Enter API key" />
    </Modal>
  );
};

export default ApiKeyModal;

// Styled components
const KeyIcon = styled(KeyOutlined)`
  color: ${Colors.geekblue8};
  margin-right: 8px;
`;

const Strong = styled.span`
  display: block;
  font-weight: 600;
`;
