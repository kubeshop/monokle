import {useEffect, useMemo, useState} from 'react';

import {Form, Input, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeCreateHelmChartAndKustomizationModal} from '@redux/reducers/ui';

const CreateHelmChartAndKustomizationModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const {isOpen, type} = useAppSelector(state => state.ui.createHelmChartAndKustomizationModal);

  const [kustomizeForm] = useForm();

  const [availableProperties, setAvailableProperties] = useState<string[]>([]);
  const modalTitle = useMemo(() => (type === 'helm' ? 'Create Helm Chart' : 'Create Kustomization'), [type]);

  const onSubmitHandler = () => {
    kustomizeForm.validateFields().then(values => {
      console.log(values);
    });
  };

  const kustomizeInputs = useMemo(
    () => ({
      apiVersion: (
        <Form.Item
          name="apiVersion"
          label="API version"
          rules={[
            {
              required: true,
              message: 'Please provide an API version!',
            },
          ]}
        >
          <Input />
        </Form.Item>
      ),
      namespace: (
        <Form.Item name="namespace" label="Namespace">
          <Input />
        </Form.Item>
      ),
    }),
    []
  );

  useEffect(() => {
    if (type === 'kustomization') {
      setAvailableProperties(Object.keys(kustomizeInputs));
    }
  }, [kustomizeInputs, type]);

  return (
    <Modal
      open={isOpen}
      title={modalTitle}
      onCancel={() => dispatch(closeCreateHelmChartAndKustomizationModal())}
      onOk={onSubmitHandler}
    >
      <Form form={kustomizeForm} layout="vertical">
        {Object.entries(kustomizeInputs).map(([name, value]) => value)}
      </Form>
    </Modal>
  );
};

export default CreateHelmChartAndKustomizationModal;
