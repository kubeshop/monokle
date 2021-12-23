import {useEffect} from 'react';

import {Button, Form, Input, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import path from 'path';

import {AlertEnum} from '@models/alert';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {closeRenameEntityModal} from '@redux/reducers/ui';

import {RenameEntityCallback, checkIfEntityExists, renameEntity} from '@utils/files';
import {useFocus} from '@utils/hooks';

const prohibitedFirstSymbols = ['/', '\\'];

const RenameEntityModal: React.FC = () => {
  const uiState = useAppSelector(state => state.ui.renameEntityModal);

  const dispatch = useAppDispatch();

  const [renameEntityForm] = useForm();

  const [inputRef, focus] = useFocus<any>();

  // If onFinish is called it means that all the values are validated and correct, there is not need to check if some of them are invalid
  const onFinish = (values: {newEntityName: string}) => {
    const {newEntityName} = values;

    renameEntity(uiState?.absolutePathToEntity, newEntityName, onRenaming);
  };

  const onRenaming = (args: RenameEntityCallback) => {
    const {oldAbsolutePath, newName, isDirectory, err} = args;

    const entityName = path.basename(oldAbsolutePath);
    const entityType = isDirectory ? 'directory' : 'file';

    if (err) {
      dispatch(
        setAlert({
          title: 'Renaming failed',
          message: `Something went wrong during renaming a "${entityName}" ${entityType}`,
          type: AlertEnum.Error,
        })
      );
    } else {
      dispatch(
        setAlert({
          title: `Successfully renamed a ${entityType} ${entityType}`,
          message: `You have successfully renamed a "${entityName}" ${entityType} to "${newName}"`,
          type: AlertEnum.Success,
        })
      );

      dispatch(closeRenameEntityModal());
    }
  };

  useEffect(() => {
    if (uiState.isOpen) {
      focus();
      renameEntityForm.setFieldsValue({newEntityName: uiState.entityName});
    } else {
      renameEntityForm.setFieldsValue({newEntityName: ''});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiState]);

  if (!uiState.isOpen) {
    return null;
  }

  return (
    <Modal
      title="Rename entity"
      visible={uiState?.isOpen}
      onCancel={() => {
        dispatch(closeRenameEntityModal());
      }}
      footer={[
        <Button
          key="cancel"
          onClick={() => {
            dispatch(closeRenameEntityModal());
          }}
        >
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => {
            renameEntityForm.submit();
          }}
        >
          Submit
        </Button>,
      ]}
    >
      <Form layout="vertical" form={renameEntityForm} initialValues={{newEntityName: ''}} onFinish={onFinish}>
        <Form.Item
          label="Entity name"
          name="newEntityName"
          rules={[
            ({getFieldValue}) => ({
              validator: () => {
                return new Promise((resolve: (value?: any) => void, reject) => {
                  const newEntityNameValue: string = getFieldValue('newEntityName').toLowerCase();

                  // If the input is empty - it is not valid
                  if (!newEntityNameValue) {
                    reject(new Error("This field can't be empty"));
                  }

                  // If the old name and the new name are equal - it is valid
                  if (newEntityNameValue.toLowerCase() === uiState.entityName.toLowerCase()) {
                    resolve();
                  }

                  if (prohibitedFirstSymbols.some(symbol => symbol === newEntityNameValue[0])) {
                    reject(
                      new Error(`File or folder name can't start with prohibited symbol - "${newEntityNameValue[0]}"`)
                    );
                  }

                  // If the new name equals to any name of any children on the same nesting level - it is not valid
                  if (
                    checkIfEntityExists(uiState.absolutePathToEntity.replace(uiState.entityName, newEntityNameValue))
                  ) {
                    reject(new Error('File or folder with this name already exists in this location'));
                  }

                  resolve();
                });
              },
            }),
          ]}
        >
          <Input ref={inputRef} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RenameEntityModal;
