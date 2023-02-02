import {useMemo} from 'react';

import {PlusOutlined, SendOutlined, SettingOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {LearnPage, NewProject, SettingsPane} from '@organismsNew';

import {ProjectsList} from '@moleculesNew';

import {Icon} from '@monokle/components';

export function useStartPageOptions() {
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
      'quick-cluster-mode': {
        icon: <Icon name="cluster-dashboard" style={{fontSize: '16px'}} />,
        label: 'Cluster preview',
        content: null,
        title: '',
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
