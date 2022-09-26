import {useEffect} from 'react';

import {Form, Input, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import path from 'path';

import {AlertEnum} from '@models/alert';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {closeCreateFileFolderModal} from '@redux/reducers/ui';

import {CreateFileFolderCallback, createFile, createFolder, doesPathExist} from '@utils/files';
import {useFocus} from '@utils/hooks';

const prohibitedFirstSymbols = ['/', '\\'];

const CreateFileFolderModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const uiState = useAppSelector(state => state.ui.createFileFolderModal);

  const [createFileFolderForm] = useForm();

  const [inputRef, focus] = useFocus<any>();

  const onFinish = (values: {fileFolderName: string}) => {
    const {fileFolderName} = values;

    if (uiState.type === 'folder') {
      createFolder(uiState.rootDir, fileFolderName, onCreate);
    } else {
      createFile(uiState.rootDir, fileFolderName, onCreate);
    }
  };

  const onCreate = (args: CreateFileFolderCallback) => {
    const {fileFolderName, err} = args;

    if (err) {
      dispatch(
        setAlert({
          title: 'Creating failed',
          message: `Something went wrong during the creation of a ${uiState.type}`,
          type: AlertEnum.Error,
        })
      );
    } else {
      dispatch(
        setAlert({
          title: `Successfully created a ${uiState.type}`,
          message: `You have successfully created the "${fileFolderName}" ${uiState.type}`,
          type: AlertEnum.Success,
        })
      );

      dispatch(closeCreateFileFolderModal());
    }
  };

  useEffect(() => {
    if (uiState.isOpen) {
      focus();
    } else {
      createFileFolderForm.resetFields();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiState]);

  if (!uiState.isOpen) {
    return null;
  }

  return (
    <Modal
      title={`Create ${uiState.type}`}
      open={uiState.isOpen}
      onCancel={() => {
        dispatch(closeCreateFileFolderModal());
      }}
      okText="Submit"
      onOk={() => {
        createFileFolderForm.submit();
      }}
    >
      <Form layout="vertical" form={createFileFolderForm} onFinish={onFinish}>
        <Form.Item
          label={`${uiState.type === 'file' ? 'File' : 'Folder'} name`}
          name="fileFolderName"
          rules={[
            ({getFieldValue}) => ({
              validator: () => {
                return new Promise((resolve: (value?: any) => void, reject) => {
                  const fileFolderNameValue: string = getFieldValue('fileFolderName').toLowerCase();

                  if (!fileFolderNameValue) {
                    reject(new Error("This field can't be empty"));
                  }

                  if (prohibitedFirstSymbols.some(symbol => symbol === fileFolderNameValue[0])) {
                    reject(
                      new Error(`${uiState.type} name can't start with prohibited symbol - "${fileFolderNameValue[0]}"`)
                    );
                  }

                  if (doesPathExist(path.join(uiState.rootDir, fileFolderNameValue))) {
                    reject(new Error('A file or folder with this name already exists in this location'));
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

export default CreateFileFolderModal;
