import React, {Suspense, useCallback, useLayoutEffect, useMemo, useState} from 'react';

import {Modal} from 'antd';

import fs from 'fs';
import semver from 'semver';

import {toggleForm} from '@redux/forms';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {openWelcomeModal} from '@redux/reducers/ui';
import {setDeleteProject} from '@redux/thunks/project';

import {fetchAppVersion} from '@utils/appVersion';

import {AlertEnum} from '@shared/models/alert';
import {Project} from '@shared/models/config';
import electronStore from '@shared/utils/electronStore';
import {isInClusterModeSelector} from '@shared/utils/selectors';

const GitCloneModal = React.lazy(() => import('@organisms/GitCloneModal'));

const AboutModal = React.lazy(() => import('@organisms/AboutModal'));
const ChangeFiltersConfirmModal = React.lazy(() => import('@molecules/ChangeFiltersConfirmModal'));
const ClusterResourceDiffModal = React.lazy(() => import('@organisms/ClusterResourceDiffModal'));
const CreateFileFolderModal = React.lazy(() => import('@organisms/CreateFileFolderModal'));
const CreateProjectModal = React.lazy(() => import('@organisms/CreateProjectModal'));
const FileCompareModal = React.lazy(() => import('@organisms/FileCompareModal'));
const FiltersPresetModal = React.lazy(() => import('@organisms/FiltersPresetModal'));
const FormEditorModal = React.lazy(() => import('@components/organisms/FormEditorModal'));
const KeyboardShortcuts = React.lazy(() => import('@organisms/KeyboardShortcuts'));
const LocalResourceDiffModal = React.lazy(() => import('@organisms/LocalResourceDiffModal'));
const NewResourceWizard = React.lazy(() => import('@organisms/NewResourceWizard'));
const QuickSearchActions = React.lazy(() => import('@organisms/QuickSearchActions'));
const ReleaseNotes = React.lazy(() => import('@organisms/ReleaseNotes'));
const RenameEntityModal = React.lazy(() => import('@organisms/RenameEntityModal'));
const RenameResourceModal = React.lazy(() => import('@organisms/RenameResourceModal'));
const ReplaceImageModal = React.lazy(() => import('@organisms/ReplaceImageModal'));
const SaveEditCommandModal = React.lazy(() => import('@organisms/SaveEditCommandModal'));
const SaveResourcesToFileFolderModal = React.lazy(() => import('@molecules/SaveResourcesToFileFolderModal'));
const ScaleModal = React.lazy(() => import('@organisms/ScaleModal'));
const TemplateExplorer = React.lazy(() => import('@organisms/TemplateExplorer'));
const WelcomeModal = React.lazy(() => import('@organisms/WelcomeModal'));
const AIGenerationModal = React.lazy(() => import('@molecules/AIGenerationModal'));

const GlobalModals = () => {
  const dispatch = useAppDispatch();

  const [showReleaseNotes, setShowReleaseNotes] = useState<boolean>(false);
  const [appVersion, setAppVersion] = useState<string>();

  const isChangeFiltersConfirmModalVisible = useAppSelector(state => state.main.filtersToBeChanged);
  const isCreateFileFolderModalVisible = useAppSelector(state => state.ui.createFileFolderModal.isOpen);
  const isCreateProjectModalVisible = useAppSelector(state => state.ui.createProjectModal.isOpen);
  const isFileCompareModalVisible = useAppSelector(state => state.ui.fileCompareModal.isVisible);
  const isFiltersPresetModalVisible = useAppSelector(state => state.ui.filtersPresetModal?.isOpen);
  const isGitCloneModalVisible = useAppSelector(state => state.git.gitCloneModal.open);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isNewResourceWizardVisible = useAppSelector(state => state.ui.newResourceWizard.isOpen);
  const isQuickSearchActionsVisible = useAppSelector(state => state.ui.quickSearchActionsPopup.isOpen);
  const isRenameEntityModalVisible = useAppSelector(state => state.ui.renameEntityModal.isOpen);
  const isRenameResourceModalVisible = useAppSelector(state => state.ui.renameResourceModal?.isOpen);
  const isReplaceImageModalVisible = useAppSelector(state => state.ui.replaceImageModal?.isOpen);
  const isSaveEditCommandModalVisible = useAppSelector(state => state.ui.saveEditCommandModal.isOpen);
  const isSaveResourcesToFileFolderModalVisible = useAppSelector(
    state => state.ui.saveResourcesToFileFolderModal.isOpen
  );
  const isFormModalVisible = useAppSelector(state => state.form.isOpen);
  const isAboutModalVisible = useAppSelector(state => state.ui.isAboutModalOpen);
  const isKeyboardShortcutsVisible = useAppSelector(state => state.ui.isKeyboardShortcutsModalOpen);
  const isTemplateExplorerVisible = useAppSelector(state => state.ui.templateExplorer.isVisible);
  const projects: Project[] = useAppSelector(state => state.config.projects);
  const targetResourceId = useAppSelector(state => state.main.resourceDiff.targetResourceId);
  const isScaleModalVisible = useAppSelector(state => state.ui.scaleModal.isOpen);
  const isWelcomeModalVisible = useAppSelector(state => state.ui.welcomeModal.isVisible);
  const isNewAiResourceWizardVisible = useAppSelector(state => state.ui.newAiResourceWizard.isOpen);

  const isClusterResourceDiffModalVisible = useMemo(
    () => Boolean(targetResourceId) && isInClusterMode,
    [isInClusterMode, targetResourceId]
  );

  const isLocalResourceDiffModalVisible = useMemo(
    () => Boolean(targetResourceId) && !isInClusterMode,
    [isInClusterMode, targetResourceId]
  );

  const onCloseReleaseNotes = useCallback(() => {
    setShowReleaseNotes(false);
    electronStore.set('appConfig.lastSeenReleaseNotesVersion', appVersion);
  }, [appVersion]);

  useLayoutEffect(() => {
    fetchAppVersion().then(version => {
      setAppVersion(version);

      const lastSeenReleaseNotesVersion = electronStore.get('appConfig.lastSeenReleaseNotesVersion');

      const nextMajorReleaseVersion = semver.inc(lastSeenReleaseNotesVersion, 'minor');

      // new user
      if (!semver.valid(lastSeenReleaseNotesVersion)) {
        dispatch(openWelcomeModal());
        electronStore.set('appConfig.lastSeenReleaseNotesVersion', version);
      } else if (
        // check if the current version is the next big release version for showing the modal with release notes
        semver.valid(lastSeenReleaseNotesVersion) &&
        semver.satisfies(version, `>=${nextMajorReleaseVersion}`)
      ) {
        setShowReleaseNotes(true);
      }

      // if middle release, show silent notification
      else if (semver.satisfies(version, `>${lastSeenReleaseNotesVersion} <${nextMajorReleaseVersion}`)) {
        dispatch(
          setAlert({
            title: 'A new version of Monokle has been installed!',
            message: '',
            type: AlertEnum.Success,
            silent: true,
          })
        );

        electronStore.set('appConfig.lastSeenReleaseNotesVersion', version);
      }
    });

    // check if current projects root folder still exists, otherwise delete it
    Promise.resolve().then(() => {
      projects.forEach(project => {
        if (!fs.existsSync(project.rootFolder)) {
          dispatch(setDeleteProject(project));
          dispatch(
            setAlert({
              title: 'Project removed',
              message: `We removed project ${project.name} from Monokle because its root folder no longer exists`,
              type: AlertEnum.Warning,
            })
          );
        }
      });
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCloseFormModal = useCallback(() => {
    dispatch(toggleForm(false));
  }, [dispatch]);

  return (
    <>
      <Suspense fallback={null}>
        {isAboutModalVisible && <AboutModal />}
        {isChangeFiltersConfirmModalVisible && <ChangeFiltersConfirmModal />}
        {isClusterResourceDiffModalVisible && <ClusterResourceDiffModal />}
        {isFileCompareModalVisible && <FileCompareModal />}
        {isFormModalVisible && <FormEditorModal visible={isFormModalVisible} onClose={onCloseFormModal} />}
        {isCreateFileFolderModalVisible && <CreateFileFolderModal />}
        {isCreateProjectModalVisible && <CreateProjectModal />}
        {isFiltersPresetModalVisible && <FiltersPresetModal />}
        {isGitCloneModalVisible && <GitCloneModal />}
        {isKeyboardShortcutsVisible && <KeyboardShortcuts />}
        {isLocalResourceDiffModalVisible && <LocalResourceDiffModal />}
        {isNewResourceWizardVisible && <NewResourceWizard />}
        {isQuickSearchActionsVisible && <QuickSearchActions />}
        {isRenameEntityModalVisible && <RenameEntityModal />}
        {isRenameResourceModalVisible && <RenameResourceModal />}
        {isReplaceImageModalVisible && <ReplaceImageModal />}
        {isSaveEditCommandModalVisible && <SaveEditCommandModal />}
        {isNewAiResourceWizardVisible && <AIGenerationModal />}
        {isScaleModalVisible && <ScaleModal />}
        {isSaveResourcesToFileFolderModalVisible && <SaveResourcesToFileFolderModal />}
        {showReleaseNotes && (
          <Modal
            width="900px"
            title="New Release"
            open={showReleaseNotes}
            onCancel={onCloseReleaseNotes}
            centered
            footer={null}
          >
            <ReleaseNotes onClose={onCloseReleaseNotes} />
          </Modal>
        )}
        {isTemplateExplorerVisible && <TemplateExplorer />}
        {isWelcomeModalVisible && <WelcomeModal />}
      </Suspense>
    </>
  );
};

export default GlobalModals;
