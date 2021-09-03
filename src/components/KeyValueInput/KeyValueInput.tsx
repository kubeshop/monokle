import React, {useState} from 'react';
import styled from 'styled-components';
import {Select, Button} from 'antd';
import {PlusOutlined} from '@ant-design/icons';

const Container = styled.div``;
const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const TitleLabel = styled.span``;

const KeyValueContainer = styled.div`
  display: flex;
`;

type KeyValueInputProps = {
  label: string;
  labelStyle?: React.CSSProperties;
  data: any;
  onChange: (key: string, value?: string) => void;
};

export const ANY_VALUE = '<any>';

function KeyValueInput(props: KeyValueInputProps) {
  const {label, labelStyle, data, onChange} = props;

  const [selectedKey, setSelectedKey] = useState<string>();
  const [selectedValue, setSelectedValue] = useState<string>(ANY_VALUE);

  const updateSelectedKey = (newKey: string) => {
    setSelectedKey(newKey);
    setSelectedValue(ANY_VALUE);
    if (newKey) {
      onChange(newKey);
    }
  };

  const updateSelectedValue = (newValue: string) => {
    setSelectedValue(newValue);
    if (selectedKey) {
      onChange(selectedKey, newValue);
    }
  };

  return (
    <Container>
      <TitleContainer>
        <TitleLabel style={labelStyle}>{label}</TitleLabel>
        <Button type="link" icon={<PlusOutlined />}>
          Add
        </Button>
      </TitleContainer>
      <KeyValueContainer>
        <Select value={selectedKey} onChange={updateSelectedKey}>
          {Object.keys(data).map(key => (
            <Select.Option key={key} value={key}>
              {key}
            </Select.Option>
          ))}
        </Select>
        {selectedKey && (
          <Select value={selectedValue} defaultValue={ANY_VALUE} onChange={updateSelectedValue}>
            <Select.Option key={ANY_VALUE} value={ANY_VALUE}>
              {ANY_VALUE}
            </Select.Option>
            {data[selectedKey].map((value: string) => (
              <Select.Option key={value} value={value}>
                {value}
              </Select.Option>
            ))}
          </Select>
        )}
      </KeyValueContainer>
    </Container>
  );
}

export default KeyValueInput;
