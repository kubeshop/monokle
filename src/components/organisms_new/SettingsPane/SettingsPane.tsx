import {useMemo, useState} from 'react';

import {useAppSelector} from '@redux/hooks';

import {TitleBarWrapper} from '@components/atoms';

import {TitleBar} from '@monokle/components';
import {activeProjectSelector} from '@shared/utils/selectors';

import ValidationSettings from '../ValidationSettings';
import {CurrentProjectSettings} from './CurrentProjectSettings/CurrentProjectSettings';
import {DefaultProjectSettings} from './DefaultProjectSettings/DefaultProjectSettings';
import {GlobalSettings} from './GlobalSettings/GlobalSettings';
import {PluginManager} from './PluginsManager/PluginManager';
import * as S from './SettingsPane.styled';

const SettingsPane = () => {
  const activeProject = useAppSelector(activeProjectSelector);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);

  const isOnStartProjectPage = useMemo(
    () => !activeProject || isStartProjectPaneVisible,
    [activeProject, isStartProjectPaneVisible]
  );

  const [activeTabKey, setActiveTabKey] = useState('validation');

  const tabItems = useMemo(
    () => [
      ...(activeProject && !isStartProjectPaneVisible
        ? [
            {
              key: 'validation',
              label: <S.TabOption>Validation</S.TabOption>,
              children: (
                <S.TabItemContainer $isOnStartProjectPage={isOnStartProjectPage}>
                  <ValidationSettings />
                </S.TabItemContainer>
              ),
            },
            {
              key: 'current-project-settings',
              label: <S.TabOption>Current project settings</S.TabOption>,
              children: (
                <S.TabItemContainer $isOnStartProjectPage={isOnStartProjectPage}>
                  <CurrentProjectSettings />
                </S.TabItemContainer>
              ),
            },
          ]
        : []),

      ...(!activeProject || isStartProjectPaneVisible
        ? [
            {
              key: 'global-settings',
              label: <S.TabOption>Global settings</S.TabOption>,
              children: (
                <S.TabItemContainer $isOnStartProjectPage={isOnStartProjectPage}>
                  <GlobalSettings />
                </S.TabItemContainer>
              ),
            },
            {
              key: 'plugins-manager',
              label: <S.TabOption>Plugins Manager</S.TabOption>,
              children: (
                <S.TabItemContainer $isOnStartProjectPage={isOnStartProjectPage}>
                  <PluginManager />
                </S.TabItemContainer>
              ),
            },
            {
              key: 'default-project-settings',
              label: <S.TabOption>Default project settings</S.TabOption>,
              children: (
                <S.TabItemContainer $isOnStartProjectPage={isOnStartProjectPage}>
                  <DefaultProjectSettings />
                </S.TabItemContainer>
              ),
            },
          ]
        : []),
    ],
    [activeProject, isOnStartProjectPage, isStartProjectPaneVisible]
  );

  return (
    <S.SettingsPaneContainer $isOnStartProjectPage={isOnStartProjectPage}>
      {!isOnStartProjectPage && (
        <TitleBarWrapper>
          <TitleBar title="Settings" />
        </TitleBarWrapper>
      )}

      <S.Tabs
        defaultActiveKey="source"
        activeKey={activeTabKey}
        items={tabItems}
        onChange={(k: string) => setActiveTabKey(k)}
      />
    </S.SettingsPaneContainer>
  );
};

export default SettingsPane;
