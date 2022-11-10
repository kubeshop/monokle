import React, {useState} from 'react';

import {Form, Input, Modal, Select} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {deleteFilterPreset, loadFilterPreset, saveFilterPreset} from '@redux/reducers/main';
import {closeFiltersPresetModal} from '@redux/reducers/ui';

import {AlertEnum} from '@monokle-desktop/shared';

import * as S from './FiltersPresetModal.styled';

const FiltersPresetModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const filtersPresets = useAppSelector(state => state.main.filtersPresets);
  const uiState = useAppSelector(state => state.ui.filtersPresetModal);

  const [showWarning, setShowWarning] = useState(false);

  const [form] = Form.useForm();

  if (!uiState) {
    return null;
  }

  const onCancel = () => {
    dispatch(closeFiltersPresetModal());
  };

  const onOk = () => {
    form.validateFields().then(values => {
      if (uiState.type === 'save') {
        const {name} = values;

        dispatch(saveFilterPreset(name));
        dispatch(setAlert({type: AlertEnum.Success, title: `Successfully saved ${name}`, message: ''}));
      } else {
        const {preset} = values;

        dispatch(loadFilterPreset(preset));
        dispatch(setAlert({type: AlertEnum.Success, title: `Successfully loaded ${preset}`, message: ''}));
      }

      dispatch(closeFiltersPresetModal());
    });
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

  const onPresetDelete = (e: any, key: string) => {
    e.stopPropagation();

    Modal.confirm({
      title: `Are you sure you want to delete ${key}?`,
      onOk() {
        dispatch(deleteFilterPreset(key));

        if (key === form.getFieldValue('preset')) {
          form.setFieldValue('preset', '');
        }

        dispatch(setAlert({type: AlertEnum.Success, title: `Successfully deleted ${key}`, message: ''}));
      },
      onCancel() {},
    });
  };

  return (
    <Modal
      title={`${uiState?.type === 'load' ? 'Load' : 'Save'} filters preset`}
      open={uiState.isOpen}
      onCancel={onCancel}
      onOk={onOk}
    >
      <Form form={form} layout="vertical">
        {uiState.type === 'load' ? (
          <Form.Item name="preset" rules={[{required: true, message: 'Please select a preset first!'}]}>
            <S.Select
              autoFocus
              defaultOpen
              popupClassName="filters-preset-dropdown"
              placeholder="Select filter preset"
              showSearch
            >
              {Object.keys(filtersPresets).map(key => (
                <Select.Option key={key} value={key}>
                  {key} <S.DeleteOutlined onClick={(e: any) => onPresetDelete(e, key)} />
                </Select.Option>
              ))}
            </S.Select>
          </Form.Item>
        ) : (
          <>
            <Form.Item name="name" label="Preset name" rules={[{required: true, message: 'Preset name is required'}]}>
              <Input id="filters-preset-name-input" placeholder="Enter preset name" onChange={onPresetNameChange} />
            </Form.Item>

            {showWarning && (
              <S.ReplaceWarning>Duplicate preset name, saving will replace the existing one!</S.ReplaceWarning>
            )}
          </>
        )}
      </Form>
    </Modal>
  );
};

export default FiltersPresetModal;
