import {useCallback, useState} from 'react';

import {Button, Modal} from 'antd';

import {createUseComponentHook} from '@utils/hooks';

import {didEditorContentChange} from './editor.instance';

type WarnUnsavedChangesModalProps = {
  open?: boolean;
  onClose?: () => void;
};

const WarnUnsavedChangesModal = (props?: WarnUnsavedChangesModalProps) => {
  const {open, onClose} = props || {};
  return (
    <Modal
      open={open}
      centered
      footer={
        <div>
          <Button onClick={onClose}>Cancel</Button>
          <Button>Discard changes</Button>
          <Button>Deploy changes</Button>
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
    alert('You have unsaved changes in your code editor.');
    setIsOpen(true);
    return true;
  }, [isOpen]);

  return [warn, ModalComponent];
};
