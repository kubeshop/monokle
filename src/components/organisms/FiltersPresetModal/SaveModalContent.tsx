import {Form, FormInstance, Input} from 'antd';

interface IProps {
  form: FormInstance<any>;
}

const SaveModalContent: React.FC<IProps> = props => {
  const {form} = props;

  return (
    <Form form={form} layout="vertical">
      <Form.Item name="name" label="Preset name" rules={[{required: true, message: 'Preset name is required'}]}>
        <Input id="filters-preset-name-input" placeholder="Enter preset name" />
      </Form.Item>
    </Form>
  );
};

export default SaveModalContent;
