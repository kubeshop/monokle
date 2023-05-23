import {Button, Form, Input, Modal} from 'antd';

import {useAppDispatch} from '@redux/hooks';
import {pullHelmChart} from '@redux/thunks/pullHelmChart';

import {FileExplorer} from '@components/atoms';

import {useFileExplorer} from '@hooks/useFileExplorer';

const PullHelmChartModal = ({
  open,
  dismissModal,
  chartName,
  chartVersion,
}: {
  open: boolean;
  dismissModal: () => void;
  chartName: string;
  chartVersion: string;
}) => {
  const [form] = Form.useForm<{name: string; path: string}>();
  const dispatch = useAppDispatch();

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (folderPath) {
        form.setFieldsValue({path: folderPath});
      }
    },
    {isDirectoryExplorer: true}
  );

  const onOkClickHandler = async () => {
    form.submit();
    const {name, path} = await form.validateFields();
    dispatch(pullHelmChart({name, path, version: chartVersion}));
    dismissModal();
  };

  return (
    <Modal open={open} onCancel={dismissModal} okText="Pull Chart" onOk={onOkClickHandler}>
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Chart name" initialValue={chartName}>
          <Input disabled />
        </Form.Item>

        <Form.Item label="Folder Path" required>
          <Input.Group compact>
            <Form.Item
              name="path"
              noStyle
              rules={[
                ({getFieldValue}) => ({
                  validator: () => {
                    return new Promise((resolve: (value?: any) => void, reject) => {
                      const rootFolder: string = getFieldValue('path')?.toLowerCase();

                      if (!rootFolder) {
                        reject(new Error('Please provide path!'));
                      }

                      resolve();
                    });
                  },
                }),
              ]}
            >
              <Input style={{width: 'calc(100% - 100px)'}} />
            </Form.Item>
            <Button style={{width: '100px'}} onClick={openFileExplorer}>
              Browse
            </Button>
          </Input.Group>
        </Form.Item>
      </Form>
      <FileExplorer {...fileExplorerProps} />
    </Modal>
  );
};

export default PullHelmChartModal;
