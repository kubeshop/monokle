import Link from 'antd/lib/typography/Link';

import {useAppDispatch} from '@redux/hooks';
import {closeWelcomePopup} from '@redux/reducers/ui';

import WelcomeImage from '@assets/WelcomeImage.svg';

import * as S from './WelcomePopupContent.styled';

const WelcomePopupContent: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <S.Container>
      <S.Image src={WelcomeImage} />
      <S.Title>Welcome!</S.Title>
      <S.Content>
        <b>Click on Learn</b> to take a quick ride through Monokle&rsquo;s main features.{' '}
        <Link onClick={() => dispatch(closeWelcomePopup())}>Dismiss this</Link> if you feel confident enough - you can
        come back here any time!
      </S.Content>

      <S.CloseOutlined onClick={() => dispatch(closeWelcomePopup())} />
    </S.Container>
  );
};

export default WelcomePopupContent;
