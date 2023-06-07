import {useCallback, useState} from 'react';

import {Button, Modal} from 'antd';

import {parse as parseYaml} from 'yaml';

import {useAppDispatch} from '@redux/hooks';
import {selectResource} from '@redux/reducers/main';
import {useSelectedResource} from '@redux/selectors/resourceSelectors';
import {applyResourceToCluster} from '@redux/thunks/applyResource';

import {createUseComponentHook} from '@utils/hooks';

import {trackEvent} from '@shared/utils';

import {didEditorContentChange, getEditor} from './editor.instance';

type WarnUnsavedChangesModalProps = {
  open?: boolean;
  onClose?: () => void;
};

const WarnUnsavedChangesModal = (props?: WarnUnsavedChangesModalProps) => {
  const {open, onClose} = props || {};
  const dispatch = useAppDispatch();

  const selectedResource = useSelectedResource();

  const onDeploy = useCallback(() => {
    if (!selectedResource) return;

    const editor = getEditor();
    const updatedResourceText = editor?.getModel()?.getValue();

    if (!updatedResourceText) return;

    const updatedResourceObject = parseYaml(updatedResourceText);

    trackEvent('cluster/actions/update_manifest', {kind: selectedResource.kind});
    dispatch(
      applyResourceToCluster({
        resourceIdentifier: {
          id: selectedResource.id,
          storage: 'cluster',
        },
        namespace: updatedResourceObject.metadata?.namespace
          ? {name: updatedResourceObject.metadata.namespace, new: false}
          : undefined,
        options: {
          isInClusterMode: true,
          providedResourceObject: updatedResourceObject,
        },
      })
    );

    onClose && onClose();
  }, [selectedResource, dispatch, onClose]);

  const onDiscard = useCallback(() => {
    if (!selectedResource) return;
    dispatch(selectResource({resourceIdentifier: selectedResource}));
    onClose && onClose();
  }, [selectedResource, dispatch, onClose]);

  return (
    <Modal
      open={open}
      centered
      footer={
        <div>
          <Button type="primary" onClick={onDeploy}>
            Deploy changes
          </Button>
          <Button onClick={onDiscard}>Discard changes</Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      }
    >
      <div>
        <p>Pick what you would like to do with your changes.</p>
        <p>If you deploy them, they will be applied to the cluster.</p>
        <p>If you discard them, they will be lost.</p>
      </div>
    </Modal>
  );
};

const useModalComponent = createUseComponentHook(WarnUnsavedChangesModal);

export const useWarnUnsavedChanges = (): [() => boolean, () => JSX.Element] => {
  const [isOpen, setIsOpen] = useState(false);
  const ModalComponent = useModalComponent({open: isOpen, onClose: () => setIsOpen(false)});

  const warn = useCallback(() => {
    if (!didEditorContentChange() || isOpen) {
      return false;
    }
    // es-lint-disable-next-line no-alert
    alert('You have unsaved changes in your code editor.'); // Prevents closing the drawer by blocking clicks outside.
    setIsOpen(true);
    return true;
  }, [isOpen]);

  return [warn, ModalComponent];
};
