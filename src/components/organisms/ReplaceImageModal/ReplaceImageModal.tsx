import {useMemo} from 'react';

import {Form, Input, Modal} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeReplaceImageModal} from '@redux/reducers/ui';
import {useActiveResourceMapRef} from '@redux/selectors/resourceMapSelectors';
import {replaceImageTag} from '@redux/thunks/replaceImageTag';

const ReplaceImageModal: React.FC = () => {
  const [form] = Form.useForm();

  const dispatch = useAppDispatch();
  const imagesList = useAppSelector(state => state.main.imagesList);
  const resourceMapRef = useActiveResourceMapRef();
  const uiState = useAppSelector(state => state.ui.replaceImageModal);

  const image = useMemo(() => {
    if (!uiState) {
      return null;
    }

    return imagesList.find(im => im.id === uiState.imageId);
  }, [imagesList, uiState]);

  if (!uiState || !image) {
    return null;
  }

  const handleCancel = () => {
    dispatch(closeReplaceImageModal());
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      const {tag} = values;

      replaceImageTag(image, tag, resourceMapRef.current, dispatch);
      dispatch(closeReplaceImageModal());
    });
  };

  return (
    <Modal title={`Replace ${image.name}:${image.tag}`} open={uiState.isOpen} onCancel={handleCancel} onOk={handleOk}>
      <Form form={form} layout="vertical">
        <Form.Item
          name="tag"
          label="New Image Tag"
          rules={[
            ({getFieldValue}) => ({
              required: true,
              validator: () =>
                new Promise((resolve: (value?: any) => void, reject) => {
                  const newTag = getFieldValue('tag');

                  if (!newTag) {
                    reject(new Error('This field is required'));
                  }

                  if (newTag === image.tag) {
                    reject(new Error('Tag must be different'));
                  }

                  resolve();
                }),
            }),
          ]}
        >
          <Input id="image-tag-input" placeholder="Enter image tag" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReplaceImageModal;
