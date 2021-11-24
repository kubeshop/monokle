/* eslint-disable unused-imports/no-unused-imports-ts */
import {useEffect} from 'react';

import {Button, Form, Input, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import path from 'path';

import {AlertEnum} from '@models/alert';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {closeCreateDirectoryModal, closeRenameEntityModal} from '@redux/reducers/ui';

import {CreateDirectoryCallback, checkIfEntityExists, createDirectory} from '@utils/files';
import {useFocus} from '@utils/hooks';

const prohibitedFirstSymbols = ['/', '\\'];

const CreateDirectoryModal: React.FC = () => {
  const uiState = useAppSelector(state => state.ui.createDirectoryModal);

  const dispatch = useAppDispatch();

  const [createFolderForm] = useForm();

  const [inputRef, focus] = useFocus<any>();

  const onFinish = (values: {directoryName: string}) => {
    const {directoryName} = values;

    createDirectory(uiState.rootDir, directoryName, onCreate);
  };

  const onCreate = (args: CreateDirectoryCallback) => {
    const {dirName, err} = args;

    if (err) {
      dispatch(
        setAlert({
          title: 'Creating failed',
          message: 'Something went wrong during creating a directory',
          type: AlertEnum.Error,
        })
      );
    } else {
      dispatch(
        setAlert({
          title: 'Successfully created a directory',
          message: `You have successfully created the "${dirName}" directory`,
          type: AlertEnum.Success,
        })
      );

      dispatch(closeCreateDirectoryModal());
    }
  };

  useEffect(() => {
    if (uiState.isOpen) {
      focus();
    } else {
      createFolderForm.resetFields();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiState]);

  if (!uiState.isOpen) {
    return null;
  }

  return (
    <Modal
      title="Create directory"
      visible={uiState?.isOpen}
      onCancel={() => {
        dispatch(closeCreateDirectoryModal());
      }}
      footer={[
        <Button
          key="cancel"
          onClick={() => {
            dispatch(closeCreateDirectoryModal());
          }}
        >
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => {
            createFolderForm.submit();
          }}
        >
          Submit
        </Button>,
      ]}
    >
      <Form layout="vertical" form={createFolderForm} initialValues={{directoryName: ''}} onFinish={onFinish}>
        <Form.Item
          label="Directory name"
          name="directoryName"
          rules={[
            ({getFieldValue}) => ({
              validator: (rule, value) => {
                return new Promise((resolve: (value?: any) => void, reject) => {
                  const directoryNameValue: string = getFieldValue('directoryName').toLowerCase();

                  if (!directoryNameValue) {
                    reject(new Error("This field can't be empty"));
                  }

                  if (prohibitedFirstSymbols.some(symbol => symbol === directoryNameValue[0])) {
                    reject(new Error(`Directory name can't start with prohibited symbol - "${directoryNameValue[0]}"`));
                  }

                  if (checkIfEntityExists(path.join(uiState.rootDir, path.sep, directoryNameValue))) {
                    reject(new Error('A file or directory with this name already exists in this location'));
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

export default CreateDirectoryModal;
