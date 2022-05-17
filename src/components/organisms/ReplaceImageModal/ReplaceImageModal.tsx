import {Form, Input, Modal} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeReplaceImageModal} from '@redux/reducers/ui';

const ReplaceImageModal: React.FC = () => {
  const [form] = Form.useForm();

  const dispatch = useAppDispatch();
  const uiState = useAppSelector(state => state.ui.replaceImageModal);

  if (!uiState) {
    return null;
  }

  const handleCancel = () => {
    dispatch(closeReplaceImageModal());
  };

  return (
    <Modal visible={uiState.isOpen} onCancel={handleCancel}>
      <Form form={form} layout="vertical">
        <Form.Item name="tag" label="New Image Tag" rules={[{required: true, message: 'This field is required'}]}>
          <Input id="image-tag-input" placeholder="Enter image tag" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReplaceImageModal;
