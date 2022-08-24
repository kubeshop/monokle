import {useEffect, useState} from 'react';

import {Button, Divider, Modal, Typography} from 'antd';

import path from 'path';
import semver from 'semver';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeAboutModal} from '@redux/reducers/ui';
import {loadResource} from '@redux/services';

import {useAppVersion} from '@hooks/useAppVersion';

import {fetchAppVersion} from '@utils/appVersion';

import MonokleAbout from '@assets/MonokleAbout.svg';

import packageJson from '@root/package.json';

import * as S from './AboutModal.styled';

const {Text} = Typography;

const INCLUDED_DEPENDENCIES = ['react', 'electron', 'antd', 'monaco-editor', 'monaco-yaml'];
const allDeps = {...packageJson.devDependencies, ...packageJson.dependencies};
const filteredDependencies = Object.entries(allDeps).filter(([name]) => INCLUDED_DEPENDENCIES.includes(name));

type About = {
  title: string;
  features: string[];
  when: string;
};

const AboutModal = () => {
  const dispatch = useAppDispatch();
  const aboutModalVisible = useAppSelector(state => state.ui.isAboutModalOpen);
  const appVersion = useAppVersion();
  const [about, setAbout] = useState<About>();

  const handleClose = () => {
    dispatch(closeAboutModal());
  };

  useEffect(() => {
    fetchAppVersion().then(version => {
      const parsedVersion = semver.parse(version);
      if (!parsedVersion) {
        return;
      }
      const releaseVersion = `${parsedVersion.major}.${parsedVersion.minor}`;
      const rawVersionInfo = loadResource(path.join('releaseNotes', releaseVersion, `${releaseVersion}.json`));
      if (!rawVersionInfo) {
        return;
      }
      const versionInfo = JSON.parse(rawVersionInfo);
      const {about: aboutInfo} = versionInfo || {};
      setAbout(aboutInfo);
    });
  }, []);

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
        <S.ContentContainerDiv>
          <S.ContentDiv>
            <img src={MonokleAbout} />
            <S.TextContainer>
              <Text>Version: {appVersion}</Text>
              <Text>Released in {about?.when}</Text>
              <Divider style={{margin: '8px 0'}} />
              <Text>
                {about?.title}
                <ul>
                  {about?.features.map(feat => (
                    <li key={feat}>{feat}</li>
                  ))}
                </ul>
                Packages:
                <ul>
                  {filteredDependencies.map(([name, version]) => (
                    <li key={name}>
                      {name}: {version}
                    </li>
                  ))}
                </ul>
              </Text>
            </S.TextContainer>
          </S.ContentDiv>
        </S.ContentContainerDiv>
      </span>
    </Modal>
  );
};

export default AboutModal;
