import {useCallback, useMemo} from 'react';

import {PlusOutlined, SendOutlined, SettingOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useAppDispatch} from '@redux/hooks';
import {setStartPageLearnTopic} from '@redux/reducers/ui';

import {NewProject, SettingsPane} from '@organismsNew';

import {ProjectsList} from '@moleculesNew';

import {Icon, LearnPage, LearnTopicType} from '@monokle/components';
import {openDiscord, openDocumentation, openTutorialVideo} from '@shared/utils/shell';

export function useStartPageOptions() {
  const dispatch = useAppDispatch();

  const onLearnCardClickHandler = useCallback(
    (topic: LearnTopicType) => {
      dispatch(setStartPageLearnTopic(topic));
    },
    [dispatch]
  );

  const options = useMemo(
    () => ({
      'recent-projects': {
        icon: <StyledSendOutlined />,
        label: 'Recent projects',
        content: <ProjectsList type="recent" />,
        title: 'Recent projects',
      },
      'all-projects': {
        icon: <Icon name="all-projects" style={{fontSize: '16px'}} />,
        label: 'All projects',
        content: <ProjectsList type="all" />,
        title: 'All projects',
      },
      settings: {
        icon: <StyledSettingsOutlined />,
        label: 'Settings',
        content: <SettingsPane />,
        title: 'Settings',
      },
      'new-project': {
        icon: <StyledPlusOutlined />,
        label: 'New project',
        content: <NewProject />,
        title: 'Start something new',
      },
      'cluster-preview': {
        icon: <Icon name="cluster-dashboard" style={{fontSize: '16px'}} />,
        label: 'Cluster preview',
        content: null,
        title: '',
      },
      learn: {
        icon: null,
        label: 'Learn',
        content: (
          <LearnPage
            onHelpfulResourceCardClick={topic => {
              if (topic === 'documentation') {
                openDocumentation();
              } else if (topic === 'discord') {
                openDiscord();
              } else if (topic === 'video-tutorial') {
                openTutorialVideo();
              }
            }}
            onLearnCardClick={onLearnCardClickHandler}
          />
        ),
        title: 'Learn',
      },
    }),
    [onLearnCardClickHandler]
  );

  return options;
}

const StyledPlusOutlined = styled(PlusOutlined)`
  font-size: 16px;
  padding-top: 1px;
`;

const StyledSendOutlined = styled(SendOutlined)`
  transform: rotate(315deg) translate(3px, 0px);
  font-size: 16px;
`;

const StyledSettingsOutlined = styled(SettingOutlined)`
  font-size: 16px;
  padding-top: 1px;
`;
