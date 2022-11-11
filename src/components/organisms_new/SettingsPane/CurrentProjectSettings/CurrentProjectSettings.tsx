import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {changeCurrentProjectName, updateProjectConfig} from '@redux/reducers/appConfig';
import {activeProjectSelector, currentConfigSelector} from '@redux/selectors';

import {Project, ProjectConfig} from '@monokle-desktop/shared/models';

import {Settings} from '../Settings/Settings';

export const CurrentProjectSettings = () => {
  const dispatch = useAppDispatch();
  const mergedConfig: ProjectConfig = useAppSelector(currentConfigSelector);
  const activeProject: Project | undefined = useAppSelector(activeProjectSelector);
  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);

  const changeProjectConfig = (config: ProjectConfig) => {
    dispatch(updateProjectConfig({config, fromConfigFile: false}));
  };

  const onProjectNameChange = (projectName: string) => {
    if (projectName) {
      dispatch(changeCurrentProjectName(projectName));
    }
  };

  return (
    <Settings
      config={mergedConfig}
      onConfigChange={changeProjectConfig}
      showProjectName
      projectName={activeProject?.name}
      onProjectNameChange={onProjectNameChange}
      isClusterPaneIconHighlighted={highlightedItems.clusterPaneIcon}
    />
  );
};
