import {Button, Col} from 'antd';

import {useCloudUser} from '@redux/validation/validation.hooks';

import CloudSync from '@assets/CloudSync.svg';

import {Spinner} from '@monokle/components';

import * as S from './CloudConnect.styled';

export default function CloudConnect() {
  const {connect, cloudUser, isInitializing, isConnecting} = useCloudUser();

  if (isInitializing) {
    return (
      <S.Row>
        <Spinner />
      </S.Row>
    );
  }

  return (
    <S.Row>
      <Col span={14}>
        {cloudUser ? (
          <>
            <S.Heading>Connected to Monokle Cloud 🟢</S.Heading>
            <S.Paragraph>
              E-mail: <b>{cloudUser.email}</b>
            </S.Paragraph>
            <S.Paragraph>
              Thank you for syncing Monokle Desktop with Monokle Cloud. <br />
              Your validation policies are now unified and synchronized across platforms.
            </S.Paragraph>
          </>
        ) : (
          <>
            <S.Heading>Connect with Monokle Cloud</S.Heading>
            <S.Subheading>What is Monokle Cloud?</S.Subheading>
            <S.Paragraph>
              Monokle Cloud is our comprehensive cloud-based solution designed to seamlessly synchronize, validate, and
              manage your Kubernetes configurations. By working hand-in-hand with Monokle Desktop, it ensures that your
              configurations remain consistent and error-free
            </S.Paragraph>
            <S.Subheading>Why connect?</S.Subheading>
            <ul>
              <li>
                Unified Validation: Ensure that the same validation policies applied in the cloud are consistent with
                those in your local projects.
              </li>
              <li>
                Sync Seamlessly: Automatically synchronize and update your validation rules and policies between Monokle
                Cloud and Desktop.
              </li>
              <li>
                Collaborate Efficiently: Work in tandem with your team, ensuring everyone adheres to the latest and most
                accurate configuration standards.
              </li>
            </ul>
            <Button type="primary" size="large" onClick={connect} loading={isConnecting}>
              Connect
            </Button>
          </>
        )}
      </Col>
      <Col span={10}>
        <img src={CloudSync} />
      </Col>
    </S.Row>
  );
}
