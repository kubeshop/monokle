import {Modal} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeFiltersPresetModal} from '@redux/reducers/ui';

const FiltersPresetModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const uiState = useAppSelector(state => state.ui.filtersPresetModal);

  if (!uiState) {
    return null;
  }

  const onCancel = () => {
    dispatch(closeFiltersPresetModal());
  };

  const onOk = () => {
    dispatch(closeFiltersPresetModal());
  };

  return (
    <Modal
      title={`${uiState?.type === 'load' ? 'Load' : 'Save'} filters preset`}
      visible={uiState.isOpen}
      onCancel={onCancel}
      onOk={onOk}
    >
      <div>Test</div>
    </Modal>
  );
};

export default FiltersPresetModal;
