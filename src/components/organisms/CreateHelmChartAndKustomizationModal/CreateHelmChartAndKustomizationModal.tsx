import {useMemo} from 'react';

import {Modal} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeCreateHelmChartAndKustomizationModal} from '@redux/reducers/ui';

const CreateHelmChartAndKustomizationModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const {isOpen, type} = useAppSelector(state => state.ui.createHelmChartAndKustomizationModal);

  const modalTitle = useMemo(() => (type === 'helm' ? 'Create Helm Chart' : 'Create Kustomization'), [type]);

  return (
    <Modal open={isOpen} title={modalTitle} onCancel={() => dispatch(closeCreateHelmChartAndKustomizationModal())}>
      Test
    </Modal>
  );
};

export default CreateHelmChartAndKustomizationModal;
