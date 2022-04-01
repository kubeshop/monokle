import {useMemo} from 'react';

import {Button, Modal, Typography} from 'antd';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeAboutModal} from '@redux/reducers/ui';

import {useAppVersion} from '@hooks/useAppVersion';

import {getDependencyVersion} from '@utils/getDependencyVersion';

import MonokleAbout from '@assets/MonokleAbout.svg';

import Colors from '@styles/Colors';

const {Text} = Typography;
const dependenciesList = ['react', 'electron'];

const StyledModal = styled(Modal)`
  .ant-modal-close-icon {
    font-size: 14px !important;
    color: ${Colors.grey700};
  }
  .ant-modal-body {
    position: relative;
    overflow: auto;
    background-color: ${Colors.grey1};
  }
  .ant-modal-footer {
    padding-top: 20px;
    background-color: ${Colors.grey1000};
  }
`;

const StyledContentContainerDiv = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
`;

const StyledContentDiv = styled.div`
  padding: 12px 24px;

  img {
    padding: 30px 0;
  }
`;

const HeightFillDiv = styled.div`
  display: block;
  height: 440px;
`;

const StyledTextContainer = styled.div`
  overflow: hidden;
  .ant-typography {
    display: block;
  }
`;

const StartupModal = () => {
  const dispatch = useAppDispatch();
  const aboutModalVisible = useAppSelector(state => state.ui.isAboutModalOpen);
  const appVersion = useAppVersion();

  const handleClose = () => {
    dispatch(closeAboutModal());
  };

  const dependenciesVersions = useMemo(() => getDependencyVersion(dependenciesList), [dependenciesList]);

  return (
    <StyledModal
      visible={aboutModalVisible}
      centered
      width={400}
      onCancel={handleClose}
      title="About Monokle"
      footer={
        <Button
          style={{zIndex: 100, marginBottom: 24, marginRight: 24, display: 'inline-block'}}
          type="primary"
          onClick={handleClose}
        >
          Got it!
        </Button>
      }
    >
      <span id="WelcomeModal">
        <HeightFillDiv />
        <StyledContentContainerDiv>
          <StyledContentDiv>
            <img src={MonokleAbout} />
            <StyledTextContainer>
              <Text>Version: {appVersion}</Text>
              <Text> Launched in: March 2022</Text>
              <Text>
                In this release, the focus was to:
                <ul>
                  <li>Increase the stability of Monokle</li>
                  <li>Improve the UX/UI on Helm workflows</li>
                  <li>Handle restricted cluster access</li>
                </ul>
                Other useful info:
                <ul>
                  {dependenciesVersions.map(({name, version}) => (
                    <li key={name}>
                      {name} version: {version}
                    </li>
                  ))}
                </ul>
              </Text>
            </StyledTextContainer>
          </StyledContentDiv>
        </StyledContentContainerDiv>
      </span>
    </StyledModal>
  );
};

export default StartupModal;
