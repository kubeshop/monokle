import {useMemo} from 'react';

import {PlusOutlined, SendOutlined, SettingOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {LearnPage, NewProject, SettingsPane} from '@organisms';

import {ProjectsList} from '@molecules';

import {Icon} from '@monokle/components';

export function useStartPageOptions() {
  const options = useMemo(
    () => ({
      'new-project': {
        icon: <StyledPlusOutlined />,
        label: 'New project',
        content: <NewProject />,
        title: 'Start something new',
      },
      projects: {
        icon: <StyledSendOutlined />,
        label: 'Projects',
        content: <ProjectsList />,
        title: 'Projects',
      },
      'quick-cluster-mode': {
        icon: <Icon name="cluster-dashboard" style={{fontSize: '16px'}} />,
        label: 'Connect to Cluster',
        content: null,
        title: '',
      },
      'helm-pane': {
        icon: <Icon name="helm" style={{fontSize: '16px'}} />,
        label: 'Browse Helm Charts',
        content: null,
        title: '',
      },
      settings: {
        icon: <StyledSettingsOutlined />,
        label: 'Settings',
        content: <SettingsPane />,
        title: 'Settings',
      },
      learn: {
        icon: null,
        label: 'Learn',
        content: <LearnPage />,
        title: 'Learn',
      },
    }),
    []
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
