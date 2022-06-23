import {Button, Modal, Typography} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeAboutModal} from '@redux/reducers/ui';

import {useAppVersion} from '@hooks/useAppVersion';

import MonokleAbout from '@assets/MonokleAbout.svg';

import packageJson from '@root/package.json';

import * as S from './AboutMonokle.styled';

const {Text} = Typography;

const INCLUDED_DEPENDENCIES = ['react', 'electron'];
const allDeps = {...packageJson.devDependencies, ...packageJson.dependencies};
const filteredDependencies = Object.entries(allDeps).filter(([name]) => INCLUDED_DEPENDENCIES.includes(name));

const AboutModal = () => {
  const dispatch = useAppDispatch();
  const aboutModalVisible = useAppSelector(state => state.ui.isAboutModalOpen);
  const appVersion = useAppVersion();

  const handleClose = () => {
    dispatch(closeAboutModal());
  };

  return (
    <Modal
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
        <S.HeightFillDiv />
        <S.StyledContentContainerDiv>
          <S.StyledContentDiv>
            <img src={MonokleAbout} />
            <S.StyledTextContainer>
              <Text>Version: {appVersion}</Text>
              <Text>Launched in: June 2022</Text>
              <Text>
                {/* TODO: get the below text from the releaseNotes folder */}
                In this release, we bring you:
                <ul>
                  <li>Compare Anything (literally)</li>
                  <li>New Images panel</li>
                  <li>Overall improvements</li>
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
            </S.StyledTextContainer>
          </S.StyledContentDiv>
        </S.StyledContentContainerDiv>
      </span>
    </Modal>
  );
};

export default AboutModal;
