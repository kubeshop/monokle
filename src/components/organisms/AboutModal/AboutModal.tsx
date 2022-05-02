import {Button, Modal, Typography} from 'antd';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeAboutModal} from '@redux/reducers/ui';

import {useAppVersion} from '@hooks/useAppVersion';

import MonokleAbout from '@assets/MonokleAbout.svg';

import Colors from '@styles/Colors';

import packageJson from '@root/package.json';

const {Text} = Typography;

const INCLUDED_DEPENDENCIES = ['react', 'electron'];
const allDeps = {...packageJson.devDependencies, ...packageJson.dependencies};
const filteredDependencies = Object.entries(allDeps).filter(([name]) => INCLUDED_DEPENDENCIES.includes(name));

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

const AboutModal = () => {
  const dispatch = useAppDispatch();
  const aboutModalVisible = useAppSelector(state => state.ui.isAboutModalOpen);
  const appVersion = useAppVersion();

  const handleClose = () => {
    dispatch(closeAboutModal());
  };

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
              <Text>Launched in: May 2022</Text>
              <Text>
                {/* TODO: get the below text from the releaseNotes folder */}
                In this release, the focus was to:
                <ul>
                  <li>Policy Validation by integrating OPA</li>
                  <li>Improve Helm functionality</li>
                  <li>Walkthrough tutorial</li>
                </ul>
                Other useful info:
                <ul>
                  {filteredDependencies.map(([name, version]) => (
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

export default AboutModal;
