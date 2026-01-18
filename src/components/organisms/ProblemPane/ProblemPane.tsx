import {useMemo} from 'react';
import {useMeasure} from 'react-use';

import {DEFAULT_PANE_TITLE_HEIGHT} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLeftMenuSelection} from '@redux/reducers/ui';

import {useProblemPaneMenuItems} from '@hooks/menuItemsHooks';
import {usePaneHeight} from '@hooks/usePaneHeight';

import CiCdIcon from '@assets/CiCdIcon.svg';
import KubernetesIcon from '@assets/KubernetesIcon.svg';
import ValidationSettings from '@assets/ValidationSettings.svg';
import VsCodeIcon from '@assets/VsCodeIcon.svg';

import {ProblemInfo, TitleBar} from '@monokle/components';
import {getRuleForResultV2} from '@monokle/validation';
import {
  ADMISSION_CONTROLLER_URL,
  MONOKLE_CLI_URL,
  MONOKLE_CLOUD_URL,
  POLICIES_101_BLOGPOST_URL,
  VSCODE_EXTENSION_URL,
} from '@shared/constants/urls';
import {openUrlInExternalBrowser} from '@shared/utils';

import {
  ImageColumn,
  MainBox,
  MainColumn,
  ProblemPaneContainer,
  Tabs,
  Text,
  TextColumn1,
  TextColumn2,
  TextColumn3,
  TextContainer,
  TextIcon,
  TextTitle,
  ValidationImage,
} from './ProblemPane.styled';

const ProblemPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const lastResponse = useAppSelector(state => state.validation.lastResponse);
  const selectedProblem = useAppSelector(state => state.validation.validationOverview.selectedProblem?.problem ?? null);

  const [containerRef, {width: containerWidth}] = useMeasure<HTMLDivElement>();
  const [problemInfoRef, {height: problemInfoHeight}] = useMeasure<HTMLDivElement>();

  const height = usePaneHeight();

  const tabsItems = useProblemPaneMenuItems(
    containerWidth,
    height - DEFAULT_PANE_TITLE_HEIGHT - problemInfoHeight - 70
  );

  const rule = useMemo(() => {
    if (!lastResponse || !selectedProblem) {
      return null;
    }

    return getRuleForResultV2(lastResponse.runs[0], selectedProblem);
  }, [lastResponse, selectedProblem]);

  const sarifValue = useMemo(() => {
    return JSON.stringify({...selectedProblem, rule: {...rule}}, null, 2);
  }, [rule, selectedProblem]);

  if (!rule || !selectedProblem) {
    return (
      <MainBox>
        <TextContainer>
          <MainColumn>
            <TextTitle>
              Check out misconfigurations and <b>fix them</b>
            </TextTitle>
            <Text>
              ← See a list of all found misconfigurations for the current validation settings to the left.{' '}
              <b>Click on any of them</b> to see and fix these misconfigurations in your YAML resources.
            </Text>
            <Text>
              Tweak default validation rules and learn about configuration policies in{' '}
              <a onClick={() => dispatch(setLeftMenuSelection('settings'))}>Validation Settings</a>
            </Text>
            <TextTitle>
              Enforce policies <b>everywhere!</b>
            </TextTitle>
            <Text>
              <a onClick={() => openUrlInExternalBrowser(MONOKLE_CLOUD_URL)}>Monokle Cloud</a> allows you to define your
              policies in one place and enforce them across the entire software development lifecycle
            </Text>
          </MainColumn>
          <ImageColumn>
            <ValidationImage src={ValidationSettings} />
          </ImageColumn>
          <TextColumn1>
            <TextIcon src={VsCodeIcon} />
            <Text>Locally in Monokle Desktop and VS Code</Text>
            <Text>
              <a onClick={() => openUrlInExternalBrowser(VSCODE_EXTENSION_URL)}>VSC Extension</a>
            </Text>
          </TextColumn1>
          <TextColumn2>
            <TextIcon src={CiCdIcon} />
            <Text>In your CI/CD and GitOps pipelines with the CLI</Text>
            <Text>
              <a onClick={() => openUrlInExternalBrowser(MONOKLE_CLI_URL)}>See on GitHub</a>
            </Text>
          </TextColumn2>
          <TextColumn3>
            <TextIcon src={KubernetesIcon} />
            <Text>In clusters with the Admission Controller</Text>
            <Text>
              <a onClick={() => openUrlInExternalBrowser(ADMISSION_CONTROLLER_URL)}>See on GitHub</a>
            </Text>
          </TextColumn3>
          <Text style={{gridColumn: '1 / 4', marginTop: '20px'}}>
            Read <a onClick={() => openUrlInExternalBrowser(POLICIES_101_BLOGPOST_URL)}>Kubernetes YAML Policies 101</a>{' '}
            to learn more!
          </Text>
        </TextContainer>
      </MainBox>
    );
  }

  return (
    <ProblemPaneContainer ref={containerRef} key={sarifValue}>
      <TitleBar title="Editor" type="secondary" />
      <Tabs defaultActiveKey="editor" items={tabsItems} />

      {selectedProblem && (
        <div ref={problemInfoRef}>
          <ProblemInfo
            problem={selectedProblem}
            rule={rule}
            onHelpURLClick={url => openUrlInExternalBrowser(url)}
            onSettingsClick={() => dispatch(setLeftMenuSelection('settings'))}
          />
        </div>
      )}
    </ProblemPaneContainer>
  );
};

export default ProblemPane;
