import {useEffect} from 'react';

import {Button, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeCreateProjectModal} from '@redux/reducers/ui';

const CreateProjectModal: React.FC = () => {
  const uiState = useAppSelector(state => state.ui.createProjectModal);

  const dispatch = useAppDispatch();

  const [createProjectForm] = useForm();

  useEffect(() => {
    if (uiState.isOpen) {
      console.log('OPEN');
    } else {
      createProjectForm.resetFields();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiState]);

  if (!uiState.isOpen) {
    return null;
  }

  return (
    <Modal
      title="Create a Project"
      visible={uiState?.isOpen}
      onCancel={() => {
        dispatch(closeCreateProjectModal());
      }}
      footer={[
        <Button
          key="cancel"
          onClick={() => {
            dispatch(closeCreateProjectModal());
          }}
        >
          Discard
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled
          onClick={() => {
            createProjectForm.submit();
          }}
        >
          Create Project
        </Button>,
      ]}
    >
      Create Project
    </Modal>
  );
};

export default CreateProjectModal;
