import React, {Suspense, useCallback, useLayoutEffect, useMemo, useState} from 'react';

import {Image, Modal} from 'antd';

import fs from 'fs';
import semver from 'semver';

import {isInClusterModeSelector, setDeleteProject} from '@redux/appConfig';
import {toggleForm} from '@redux/forms';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {openWelcomePopup} from '@redux/reducers/ui';

import {fetchAppVersion} from '@utils/appVersion';

import PerformanceIcon from '@assets/PerformanceIcon.svg';

import {AlertEnum} from '@shared/models/alert';
import {NewVersionCode, Project} from '@shared/models/config';
import {electronStore} from '@shared/utils';

import UpdateNotice from '../UpdateNotice/UpdateNotice';

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
const TemplateExplorer = React.lazy(() => import('@organisms/TemplateExplorer'));

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
  const newVersion = useAppSelector(state => state.config.newVersion);
  const projects: Project[] = useAppSelector(state => state.config.projects);
  const targetResourceId = useAppSelector(state => state.main.resourceDiff.targetResourceId);

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

  const isUpdateNoticeVisible = useMemo(() => {
    if (!appVersion) {
      return false;
    }

    return (
      semver.patch(appVersion) === 0 &&
      ((newVersion.code < NewVersionCode.Idle && !newVersion.data?.initial) ||
        newVersion.code === NewVersionCode.Downloaded)
    );
  }, [appVersion, newVersion]);

  useLayoutEffect(() => {
    fetchAppVersion().then(version => {
      setAppVersion(version);

      const lastSeenReleaseNotesVersion = electronStore.get('appConfig.lastSeenReleaseNotesVersion');

      const nextMajorReleaseVersion = semver.inc(lastSeenReleaseNotesVersion, 'minor');

      if (
        semver.valid(lastSeenReleaseNotesVersion) &&
        semver.satisfies(version, `>=2.0.0 <=${nextMajorReleaseVersion}`)
      ) {
        const seenPerformanceNotification = electronStore.get('appConfig.seenPerformanceNotification');

        if (!seenPerformanceNotification) {
          dispatch(
            setAlert({
              id: 'monokle_performance_alert',
              title: 'Improving performance',
              message: `In version 2.0.0 of Monokle, we have updated the interface and underlying data model to enhance your experience. Despite our best efforts, you may have encountered performance and stability issues that impacted your user experience. We apologize for any inconvenience and appreciate your patience as we are working to resolve these concerns.\n\n We are working hard to address identified issues and improve your experience with Monokle. However, there may still be room for improvement. Your feedback is crucial to us, and we invite you to share any concerns or suggestions you may have. Please [connect with us on Discord](https://discord.com/invite/6zupCZFQbe) or use the feedback form included in this version. Your input helps us continually refine and improve our product for all users.`,
              type: AlertEnum.Info,
              icon: <Image src={PerformanceIcon} />,
            })
          );

          electronStore.set('appConfig.seenPerformanceNotification', true);
        }
      }

      // new user
      if (!semver.valid(lastSeenReleaseNotesVersion)) {
        dispatch(openWelcomePopup());
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
      {isUpdateNoticeVisible && <UpdateNotice />}

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
      </Suspense>
    </>
  );
};

export default GlobalModals;
