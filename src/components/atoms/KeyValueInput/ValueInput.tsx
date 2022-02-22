import {Input, Select} from 'antd';

import {ANY_VALUE} from './constants';

type ValueInputProps = {
  value?: string;
  valueType: string;
  availableValues?: string[];
  onChange: (newValue: string) => void;
  disabled?: boolean;
};

const ValueInput: React.FC<ValueInputProps> = props => {
  const {value, valueType, availableValues, disabled, onChange} = props;

  // TODO: decide if we need a custom input for the stringArray value type
  if (valueType === 'string' || valueType === 'stringArray') {
    if (availableValues?.length) {
      return (
        <Select value={value} onChange={onChange} showSearch disabled={disabled}>
          <Select.Option key={ANY_VALUE} value={ANY_VALUE}>
            {ANY_VALUE}
          </Select.Option>
          {availableValues?.map((valueOption: string) => (
            <Select.Option key={valueOption} value={valueOption}>
              {valueOption}
            </Select.Option>
          ))}
        </Select>
      );
    }
    return <Input value={value} onChange={e => onChange(e.target.value)} disabled={disabled} />;
  }

  // TODO: decide if we want to implement more value types
  return null;
};

export default ValueInput;
