import {useMemo, useState} from 'react';

import {useAppSelector} from '@redux/hooks';

import {TitleBarWrapper} from '@components/atoms';

import DefaultLayout from '@assets/DefaultLayout.svg';
import EditorLayout from '@assets/EditorLayout.svg';

// import LayoutDark from '@assets/LayoutDark.svg';
// import LayoutWhite from '@assets/LayoutWhite.svg';
import {TitleBar} from '@monokle/components';
import {activeProjectSelector} from '@shared/utils/selectors';

import ValidationSettings from '../ValidationSettings';
import {CurrentProjectSettings} from './CurrentProjectSettings/CurrentProjectSettings';
import {DefaultProjectSettings} from './DefaultProjectSettings/DefaultProjectSettings';
import {GlobalSettings} from './GlobalSettings/GlobalSettings';
import {PluginManager} from './PluginsManager/PluginManager';
import * as S from './SettingsPane.styled';

export const SettingsPane = () => {
  const activeProject = useAppSelector(activeProjectSelector);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);

  const isOnStartProjectPage = useMemo(
    () => !activeProject || isStartProjectPaneVisible,
    [activeProject, isStartProjectPaneVisible]
  );

  const [activeTabKey, setActiveTabKey] = useState(isOnStartProjectPage ? 'validation' : 'current-project-settings');

  const tabItems = useMemo(
    () => [
      ...(activeProject && !isStartProjectPaneVisible
        ? [
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
      {
        key: 'validation',
        label: <S.TabOption>Validation</S.TabOption>,
        children: (
          <S.TabItemContainer $isOnStartProjectPage={isOnStartProjectPage}>
            <ValidationSettings />
          </S.TabItemContainer>
        ),
      },
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

export const TitleCardDescription = () => {
  const [selectedLayout, setSelectedLayout] = useState('EDITOR');
  // const [selectedTheme, setSelectedTheme] = useState('DARK');

  return (
    <S.DescriptionContainer>
      <S.OptionsContainer>
        <S.LayoutOption
          $selected={selectedLayout === 'EDITOR'}
          onClick={() => {
            setSelectedLayout('EDITOR');
          }}
        >
          <S.LayoutContainer>
            <S.LayoutTitle>Editor Layout</S.LayoutTitle>
            <S.LayoutContent>Left pane collapses when editing so you can focus</S.LayoutContent>
          </S.LayoutContainer>
          <img src={EditorLayout} />
        </S.LayoutOption>

        <S.LayoutOption
          $selected={selectedLayout === 'DEFAULT'}
          onClick={() => {
            setSelectedLayout('DEFAULT');
          }}
        >
          <S.LayoutContainer>
            <S.LayoutTitle>Default Layout</S.LayoutTitle>
            <S.LayoutContent>You manually show/hide and move your panes</S.LayoutContent>
          </S.LayoutContainer>
          <img src={DefaultLayout} />
        </S.LayoutOption>
      </S.OptionsContainer>

      {/* <S.OptionsContainer>
        <S.ThemeOption
          $selected={selectedTheme === 'DARK'}
          onClick={() => {
            setSelectedTheme('DARK');
          }}
        >
          <img src={LayoutDark} />
        </S.ThemeOption>

        <S.ThemeOption
          $selected={selectedTheme === 'LIGHT'}
          onClick={() => {
            setSelectedTheme('LIGHT');
          }}
        >
          <img src={LayoutWhite} />
        </S.ThemeOption>
      </S.OptionsContainer> */}
    </S.DescriptionContainer>
  );
};
