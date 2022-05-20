import React, {Suspense} from 'react';

import {Form, Modal, Skeleton} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeFiltersPresetModal} from '@redux/reducers/ui';

const SaveModalContent = React.lazy(() => import('./SaveModalContent'));

const FiltersPresetModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const uiState = useAppSelector(state => state.ui.filtersPresetModal);

  const [form] = Form.useForm();

  if (!uiState) {
    return null;
  }

  const onCancel = () => {
    dispatch(closeFiltersPresetModal());
  };

  const onOk = () => {
    form.validateFields().then(values => {
      const {name} = values;

      console.log(name);

      dispatch(closeFiltersPresetModal());
    });
  };

  return (
    <Modal
      title={`${uiState?.type === 'load' ? 'Load' : 'Save'} filters preset`}
      visible={uiState.isOpen}
      onCancel={onCancel}
      onOk={onOk}
    >
      <Suspense fallback={<Skeleton />}>
        {uiState.type === 'load' && null}
        {uiState.type === 'save' && <SaveModalContent form={form} />}
      </Suspense>
    </Modal>
  );
};

export default FiltersPresetModal;
