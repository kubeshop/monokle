import React, {useState} from 'react';

import {Form, Input, Modal, Select} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {loadFilterPreset, saveFilterPreset} from '@redux/reducers/main';
import {closeFiltersPresetModal} from '@redux/reducers/ui';

import * as S from './FiltersPresetModal.styled';

const FiltersPresetModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const filtersPresets = useAppSelector(state => state.main.filtersPresets);
  const uiState = useAppSelector(state => state.ui.filtersPresetModal);

  const [selectedPresetKey, setSelectedPresetKey] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const [form] = Form.useForm();

  if (!uiState) {
    return null;
  }

  const onCancel = () => {
    dispatch(closeFiltersPresetModal());
  };

  const onOk = () => {
    if (uiState.type === 'save') {
      form.validateFields().then(values => {
        const {name} = values;

        dispatch(saveFilterPreset(name));
        dispatch(closeFiltersPresetModal());
      });
    } else {
      dispatch(loadFilterPreset(selectedPresetKey));
      dispatch(closeFiltersPresetModal());
    }
  };

  const onPresetNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;

    if (Object.keys(filtersPresets).find(key => key === name)) {
      setShowWarning(true);
    }

    if (showWarning) {
      setShowWarning(false);
    }
  };

  return (
    <Modal
      title={`${uiState?.type === 'load' ? 'Load' : 'Save'} filters preset`}
      visible={uiState.isOpen}
      onCancel={onCancel}
      onOk={onOk}
    >
      {uiState.type === 'load' ? (
        <S.Select placeholder="Select filter preset" showSearch onChange={key => setSelectedPresetKey(key as string)}>
          {Object.keys(filtersPresets).map(key => (
            <Select.Option key={key} value={key}>
              {key}
            </Select.Option>
          ))}
        </S.Select>
      ) : (
        <>
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="Preset name" rules={[{required: true, message: 'Preset name is required'}]}>
              <Input id="filters-preset-name-input" placeholder="Enter preset name" onChange={onPresetNameChange} />
            </Form.Item>
          </Form>

          {showWarning && (
            <S.ReplaceWarning>Duplicate preset name, saving will replace the existing one!</S.ReplaceWarning>
          )}
        </>
      )}
    </Modal>
  );
};

export default FiltersPresetModal;
