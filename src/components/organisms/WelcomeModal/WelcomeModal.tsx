import {Button, Modal} from 'antd';
import Link from 'antd/lib/typography/Link';

import {useAppDispatch} from '@redux/hooks';
import {closeWelcomeModal, setShowStartPageLearn, setStartPageMenuOption} from '@redux/reducers/ui';

import WelcomeImage from '@assets/WelcomeImage.svg';

import * as S from './WelcomeModal.styled';

const WelcomeModal = () => {
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(closeWelcomeModal());
  };

  return (
    <Modal open centered width={500} onCancel={handleClose} footer="" wrapClassName="welcome-modal">
      <S.Container>
        <S.Image src={WelcomeImage} />
        <S.Title>Welcome!</S.Title>
        <S.Content>
          <p>
            Check out the{' '}
            <Link
              onClick={() => {
                dispatch(setShowStartPageLearn(true));
                dispatch(setStartPageMenuOption('learn'));
                handleClose();
              }}
            >
              Learn
            </Link>{' '}
            section on the top right to quickly get a quick tour on the main features and where to find them.
          </p>
          <p>
            We collect anonymous usage telemetry that helps us improve your experience. Its use is optional and can be
            disabled in{' '}
            <Link
              onClick={() => {
                dispatch(setShowStartPageLearn(false));
                dispatch(setStartPageMenuOption('settings'));
                handleClose();
              }}
            >
              Settings
            </Link>
            .
          </p>
          <p>
            <b>Ready to create your first project?</b>
          </p>
          <Button
            type="primary"
            onClick={() => {
              dispatch(setShowStartPageLearn(false));
              dispatch(setStartPageMenuOption('new-project'));
              handleClose();
            }}
          >
            Yes, take me there!
          </Button>
        </S.Content>
      </S.Container>
    </Modal>
  );
};

export default WelcomeModal;
