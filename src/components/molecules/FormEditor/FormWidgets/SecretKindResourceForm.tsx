import React, {useEffect, useState} from 'react';
import {useDebounce} from 'react-use';

import {Button, Input, Select} from 'antd';

import {DeleteOutlined} from '@ant-design/icons';

import _ from 'lodash';
import styled from 'styled-components';
import {v4 as uuidv4} from 'uuid';

import {DEFAULT_EDITOR_DEBOUNCE} from '@constants/constants';

const Option = Select.Option;
const {TextArea} = Input;

const FormContainer = styled.div`
  margin-top: 16px;
`;

const StyledSpanTitle = styled.span`
  display: block;
  margin-bottom: 4px;
`;

const secretTypes = [
  'Opaque',
  'kubernetes.io/service-account-token',
  'kubernetes.io/dockercfg',
  'kubernetes.io/dockerconfigjson',
  'kubernetes.io/basic-auth',
  'kubernetes.io/ssh-auth',
  'kubernetes.io/tls',
  'bootstrap.kubernetes.io/token',
];

export const SecretKindResourceForm = ({schema, onChange, formData, disabled, ...args}: any) => {
  const [dataKeyValuePairs, setDataKeyValuePairs] = useState<{id: string; key: string; value: string}[]>([]);
  const [stringDataKeyValuePairs, setStringDataKeyValuePairs] = useState<{id: string; key: string; value: string}[]>(
    []
  );

  const handleTypeChange = (value: any) => {
    if (formData.type !== value) {
      onChange({...formData, type: value, data: undefined, stringData: undefined});
    }
  };

  useEffect(() => {
    if (formData.data && _.isObject(formData.data)) {
      setDataKeyValuePairs(Object.keys(formData.data).map(key => ({id: uuidv4(), key, value: formData.data[key]})));
    } else {
      setDataKeyValuePairs([]);
    }
  }, [formData.data]);

  useEffect(() => {
    if (formData.stringData && _.isObject(formData.stringData)) {
      setStringDataKeyValuePairs(
        Object.keys(formData.stringData).map(key => ({id: uuidv4(), key, value: formData.stringData[key]}))
      );
    } else {
      setStringDataKeyValuePairs([]);
    }
  }, [formData.stringData]);

  useEffect(() => {
    if (dataKeyValuePairs.length === 0) {
      return;
    }
    const emptyObject: any = {};

    const data = dataKeyValuePairs.reduce((object, value) => {
      object[value.key] = value.value;
      return object;
    }, emptyObject);
    if (!_.isEqual(formData.data, data)) {
      onChange({
        ...formData,
        stringData: undefined,
        data: data || undefined,
      });
    }
  }, [dataKeyValuePairs]);

  useEffect(() => {
    if (stringDataKeyValuePairs.length === 0) {
      return;
    }
    const emptyObject: any = {};

    const stringData = stringDataKeyValuePairs.reduce((object, value) => {
      object[value.key] = value.value;
      return object;
    }, emptyObject);
    if (!_.isEqual(formData.stringData, stringData)) {
      onChange({
        ...formData,
        data: undefined,
        stringData: stringData || undefined,
      });
    }
  }, [stringDataKeyValuePairs]);

  const handleKeyValuePairFormChange = (key: string, value: {id: string; key: string; value: string}) => {
    if (key === 'stringData') {
      const keyValuePairIndex = stringDataKeyValuePairs.findIndex(pair => pair.id === value.id);
      if (keyValuePairIndex > -1) {
        stringDataKeyValuePairs[keyValuePairIndex].key = value.key;
        stringDataKeyValuePairs[keyValuePairIndex].value = value.value;
        setStringDataKeyValuePairs([...stringDataKeyValuePairs]);
      } else {
        setStringDataKeyValuePairs([...stringDataKeyValuePairs, {id: value.id, key: value.key, value: value.value}]);
      }
    }
    if (key === 'data') {
      const keyValuePairIndex = dataKeyValuePairs.findIndex(pair => pair.id === value.id);
      if (keyValuePairIndex > -1) {
        dataKeyValuePairs[keyValuePairIndex].key = value.key;
        dataKeyValuePairs[keyValuePairIndex].value = value.value;
        setDataKeyValuePairs([...dataKeyValuePairs]);
      } else {
        setDataKeyValuePairs([...dataKeyValuePairs, {id: value.id, key: value.key, value: value.value}]);
      }
    }
  };

  const handleKeyValuePairFormDelete = (key: string, value: {id: string; key: string; value: string}) => {
    if (key === 'stringData') {
      setStringDataKeyValuePairs(stringDataKeyValuePairs.filter(pair => pair.id !== value.id));
    }
    if (key === 'data') {
      setDataKeyValuePairs(dataKeyValuePairs.filter(pair => pair.id !== value.id));
    }
  };

  const handleTextAreaFormChange = (key: string, value: string) => {
    onChange({...formData, data: {[key]: value}, stringData: undefined});
  };

  return (
    <FormContainer>
      <div>
        <StyledSpanTitle>Type</StyledSpanTitle>
        <Select value={formData.type} style={{width: '100%'}} onChange={handleTypeChange}>
          {secretTypes.map(secretType => (
            <Option key={secretType} value={secretType}>
              {secretType}
            </Option>
          ))}
        </Select>
      </div>
      <div>
        {formData.type === 'Opaque' && (
          <KeyValuePairForm
            values={dataKeyValuePairs}
            onChange={(value: {id: string; key: string; value: string}) => handleKeyValuePairFormChange('data', value)}
            onDelete={(value: {id: string; key: string; value: string}) => handleKeyValuePairFormDelete('data', value)}
          />
        )}
        {formData.type === 'kubernetes.io/service-account-token' && (
          <TextAreaForm
            value={formData.data && formData.data['extra']}
            onChange={(value: string) => handleTextAreaFormChange('extra', value)}
          />
        )}
        {formData.type === 'kubernetes.io/dockercfg' && (
          <TextAreaForm
            value={formData.data && formData.data['.dockercfg']}
            onChange={(value: string) => handleTextAreaFormChange('.dockercfg', value)}
          />
        )}
        {formData.type === 'kubernetes.io/dockerconfigjson' && (
          <TextAreaForm
            value={formData.data && formData.data['.dockerconfigjson']}
            onChange={(value: string) => handleTextAreaFormChange('.dockerconfigjson', value)}
          />
        )}
        {formData.type === 'kubernetes.io/basic-auth' && (
          <KeyValuePairForm
            values={stringDataKeyValuePairs}
            onChange={(value: {id: string; key: string; value: string}) =>
              handleKeyValuePairFormChange('stringData', value)
            }
            onDelete={(value: {id: string; key: string; value: string}) =>
              handleKeyValuePairFormDelete('stringData', value)
            }
          />
        )}
        {formData.type === 'kubernetes.io/ssh-auth' && (
          <TextAreaForm
            value={formData.data && formData.data['ssh-privatekey']}
            onChange={(value: string) => handleTextAreaFormChange('ssh-privatekey', value)}
          />
        )}
        {/* {type === 'kubernetes.io/tls' && data && <TLSForm crt={data['tls.crt']} key={data['tls.key']} />} */}
        {formData.type === 'bootstrap.kubernetes.io/token' && (
          <TokenForm
            authExtraGroups={formData.data && formData.data['auth-extra-groups']}
            expiration={formData.data && formData.data['expiration']}
            tokenId={formData.data && formData.data['token-id']}
            tokenSecret={formData.data && formData.data['token-secret']}
            usageBootstrapAuthentication={formData.data && formData.data['usage-bootstrap-authentication']}
            usageBootstrapSigning={formData.data && formData.data['usage-bootstrap-signing']}
          />
        )}
      </div>
    </FormContainer>
  );
};

const KeyValuePairForm = ({
  values,
  onChange,
  onDelete,
}: {
  values: {id: string; key: string; value: string}[];
  onChange: Function;
  onDelete: Function;
}) => {
  const [localValues, setLocalValues] = useState(values);

  useEffect(() => {
    setLocalValues(values);
  }, [values]);

  const handleDynamicValueChange = (keyValuePair: {key: string; value: string}) => {
    if (onChange) {
      onChange(keyValuePair);
    }
  };

  const handleDynamicValueDelete = (keyValuePair: {key: string; value: string}) => {
    if (onDelete) {
      onDelete(keyValuePair);
    }
  };

  const handleAddNewValue = () => {
    setLocalValues([...values, {id: 'NEW_ITEM', key: '', value: ''}]);
  };

  return (
    <div style={{width: '100%', marginTop: '16px'}}>
      <StyledSpanTitle>Data</StyledSpanTitle>
      {localValues.map(value => (
        <DynamicKeyValue
          key={value.id}
          value={value}
          onChange={handleDynamicValueChange}
          onDelete={handleDynamicValueDelete}
        />
      ))}
      <div style={{marginTop: '12px'}}>
        <Button onClick={handleAddNewValue}>Add New</Button>
      </div>
    </div>
  );
};

const TextAreaForm = ({value, onChange}: {value: string; onChange: Function}) => {
  const handleValueChange = (propertyValue: string) => {
    if (onChange) {
      onChange(propertyValue);
    }
  };

  return (
    <div style={{width: '100%', marginTop: '16px'}}>
      <StyledSpanTitle>Data</StyledSpanTitle>
      <TextArea rows={6} value={value} onChange={e => handleValueChange(e.target.value)} />
    </div>
  );
};

const TokenForm = ({
  authExtraGroups,
  expiration,
  tokenId,
  tokenSecret,
  usageBootstrapAuthentication,
  usageBootstrapSigning,
}: {
  authExtraGroups: string;
  expiration: string;
  tokenId: string;
  tokenSecret: string;
  usageBootstrapAuthentication: string;
  usageBootstrapSigning: string;
}) => {
  return (
    <div style={{width: '100%', marginTop: '16px'}}>
      <StyledSpanTitle>Data</StyledSpanTitle>
      <div>
        <StyledSpanTitle>auth-extra-groups</StyledSpanTitle>
        <Input value={authExtraGroups} />
      </div>
      <div>
        <StyledSpanTitle>expiration</StyledSpanTitle>
        <Input value={expiration} />
      </div>
      <div>
        <StyledSpanTitle>tokenId</StyledSpanTitle>
        <Input value={tokenId} />
      </div>
      <div>
        <StyledSpanTitle>tokenSecret</StyledSpanTitle>
        <Input value={tokenSecret} />
      </div>
      <div>
        <StyledSpanTitle>usageBootstrapAuthentication</StyledSpanTitle>
        <Input value={usageBootstrapAuthentication} />
      </div>
      <div>
        <StyledSpanTitle>usageBootstrapSigning</StyledSpanTitle>
        <Input value={usageBootstrapSigning} />
      </div>
    </div>
  );
};

const DynamicKeyValue = ({value, onChange, onDelete}: any) => {
  const [localValue, setLocalValue] = useState<{
    id: string | undefined;
    key?: string | undefined;
    value?: string | undefined;
  }>({
    id: undefined,
    key: undefined,
    value: undefined,
  });

  useEffect(() => {
    if (value && value.id === 'NEW_ITEM') {
      setLocalValue({id: uuidv4(), key: undefined, value: undefined});
    } else {
      setLocalValue({id: value.id, key: value.key, value: value.value});
    }
  }, [value]);

  const handleValueChange = (property: string, propertyValue: string) => {
    if (property === 'KEY') {
      setLocalValue({id: localValue.id, key: propertyValue, value: localValue.value});
    }

    if (property === 'VALUE') {
      setLocalValue({id: localValue.id, key: localValue.key, value: propertyValue});
    }
  };

  const handleDeleteValue = () => {
    if (onDelete) {
      onDelete(localValue);
    }
  };

  useDebounce(
    () => {
      if (_.isEqual(localValue, value)) {
        return;
      }

      if (onChange && (localValue.key || localValue.value)) {
        onChange(localValue);
      }
    },
    DEFAULT_EDITOR_DEBOUNCE,
    [localValue]
  );

  return (
    <div style={{display: 'flex', alignItems: 'space-between', width: '100%', marginTop: '16px'}}>
      <div style={{width: '40%', marginRight: '0.33%'}}>
        <StyledSpanTitle>Key</StyledSpanTitle>
        <Input value={localValue.key} onChange={event => handleValueChange('KEY', event.target.value)} />
      </div>
      <div style={{width: '40%', marginLeft: '0.33%'}}>
        <StyledSpanTitle>Value</StyledSpanTitle>
        <Input value={localValue.value} onChange={event => handleValueChange('VALUE', event.target.value)} />
      </div>
      <div style={{width: '19%', marginLeft: '0.33%'}}>
        <StyledSpanTitle>&nbsp;</StyledSpanTitle>
        <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Button onClick={handleDeleteValue}>
            <DeleteOutlined />
          </Button>
        </div>
      </div>
    </div>
  );
};
