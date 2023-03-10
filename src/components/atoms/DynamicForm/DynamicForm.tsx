import {useState} from 'react';

import {Button, Select} from 'antd';

import {PlusOutlined} from '@ant-design/icons';

import {Theme as AntDTheme, Widgets} from '@rjsf/antd';
import {withTheme} from '@rjsf/core';
import {RJSFSchema, UiSchema, WidgetProps, Widget as WidgetType} from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';

import {useStateWithRef} from '@utils/hooks';

import formSchema from './fields.json';

const Form = withTheme(AntDTheme);

type Properties = {
  [key: string]: RJSFSchema;
};

type Props = {
  staticProperties: Properties;
  dynamicProperties: Properties;
  uiSchema?: UiSchema;
};

const baseProperties: Properties = {
  visibleDynamicFields: {
    type: 'array',
    items: {
      type: 'string',
    },
  },
};

const defaultUiSchema: UiSchema = {
  visibleDynamicFields: {
    'ui:widget': 'dynamicFieldCreator',
  },
};

const FIELD_TYPES = ['namespace', 'labels', 'annotations'];

const DynamicFieldCreatorWidget: React.FC<WidgetProps<string>> = props => {
  const {value, onChange, registry} = props;
  const [fieldType, setFieldType] = useState<string>();

  const createField = () => {
    if (!fieldType) {
      return;
    }
    onChange([...value, fieldType]);
    setFieldType(undefined);
  };

  const availableFields = FIELD_TYPES.filter(type => !registry.formContext.visibleDynamicFields.includes(type));

  return (
    <>
      <Select value={fieldType} onChange={val => setFieldType(val)}>
        {availableFields.map(type => (
          <Select.Option key={type} value={type}>
            {type}
          </Select.Option>
        ))}
      </Select>
      <Button onClick={createField} icon={<PlusOutlined />}>
        Add
      </Button>
    </>
  );
};

const createWidgetWrapper = (Widget: WidgetType) => {
  return (props: WidgetProps<any>) => {
    // const {id} = props;
    return (
      <>
        <Widget {...props} />
        <Button style={{display: 'block'}}>Remove property</Button>
      </>
    );
  };
};

console.log(Widgets);

// const DynamicFormWrapper: React.FC<Props> = props => {
//   const updatedProps = useMemo(() => {
//     const {fields} = props;
//     const newFields = Object.fromEntries(
//       Object.entries(fields).map(([type, widget]) => [type, createWidgetWrapper(widget)])
//     );
//     return {
//       ...props,
//       fields: {...newFields, dynamicFieldCreator: DynamicFieldCreatorWidget},
//     };
//   }, [props]);

//   return <DynamicForm key={JSON.stringify(updatedProps)} {...updatedProps} />;
// };

const DynamicForm: React.FC<Props> = props => {
  const {dynamicProperties, staticProperties} = props;
  const [schema, setSchema] = useState<RJSFSchema>({
    type: 'object',
    properties: {
      ...staticProperties,
      ...baseProperties,
    },
  });
  const [formData, setFormData, formDataRef] = useStateWithRef<any>({visibleDynamicFields: []});

  const [visibleDynamicFields, setVisibleDynamicFields] = useState<string[]>([]);

  const onFormChange = (event: any, id?: string) => {
    setFormData({
      ...formDataRef.current,
      ...event.formData,
    });

    console.log(event, id);

    if (id !== 'root_visibleDynamicFields') {
      return;
    }
    const {formData: updatedFormData} = event;
    const {visibleDynamicFields: updatedVisibleDynamicFields} = updatedFormData;
    setVisibleDynamicFields(updatedVisibleDynamicFields);

    const visibleDynamicProperties = Object.fromEntries(
      updatedVisibleDynamicFields.map((field: any) => [field, dynamicProperties[field]])
    );

    const newSchema: RJSFSchema = {
      type: 'object',
      properties: {
        ...staticProperties,
        ...visibleDynamicProperties,
        ...baseProperties,
      },
    };
    setSchema(newSchema);
  };

  return (
    <Form
      schema={schema}
      uiSchema={defaultUiSchema}
      validator={validator}
      // widgets={fields}
      formData={formData}
      onChange={onFormChange}
      formContext={{visibleDynamicFields}}
    />
  );
};

const TestingForm = () => {
  const {staticProperties, dynamicProperties} = formSchema as {
    staticProperties: Properties;
    dynamicProperties: Properties;
  };
  return <DynamicForm staticProperties={staticProperties} dynamicProperties={dynamicProperties} />;
};

export default TestingForm;
