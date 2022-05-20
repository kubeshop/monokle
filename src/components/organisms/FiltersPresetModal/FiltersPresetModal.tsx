import React, {useState} from 'react';

import {Form, Input, Modal, Select} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {loadFilterPreset, saveFilterPreset} from '@redux/reducers/main';
import {closeFiltersPresetModal} from '@redux/reducers/ui';

const FiltersPresetModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const filtersPresets = useAppSelector(state => state.main.filtersPresets);
  const uiState = useAppSelector(state => state.ui.filtersPresetModal);

  const [selectedPresetKey, setSelectedPresetKey] = useState('');

  const [form] = Form.useForm();

  if (!uiState) {
    return null;
  }

  const onCancel = () => {
    dispatch(closeFiltersPresetModal());
  };

  const onPresetChange = (key: string) => {
    setSelectedPresetKey(key);
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

  return (
    <Modal
      title={`${uiState?.type === 'load' ? 'Load' : 'Save'} filters preset`}
      visible={uiState.isOpen}
      onCancel={onCancel}
      onOk={onOk}
    >
      {uiState.type === 'load' ? (
        <Select placeholder="Select filter preset" showSearch style={{width: '100%'}} onChange={onPresetChange}>
          {Object.keys(filtersPresets).map(key => (
            <Select.Option key={key} value={key}>
              {key}
            </Select.Option>
          ))}
        </Select>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Preset name" rules={[{required: true, message: 'Preset name is required'}]}>
            <Input id="filters-preset-name-input" placeholder="Enter preset name" />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default FiltersPresetModal;
