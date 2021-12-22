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
  margin-top: 6px;
`;

const StyledSpanToggler = styled.span`
  cursor: pointer;
  text-decoration: underline;
  float: right;
  text-transform: uppercase;
  font-size: 9px;
  font-weight: 700;
  margin-top: 4px;
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

  const handleTokenFormChange = (key: string, value: string) => {
    onChange({...formData, data: {...formData.data, [key]: value}, stringData: undefined});
  };

  const handleTLSFormChange = (key: string, value: string) => {
    onChange({...formData, data: {...formData.data, [key]: value}, stringData: undefined});
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
        {formData.type === 'kubernetes.io/tls' && (
          <TLSForm
            tlscrt={formData.data && formData.data['tls.crt']}
            tlskey={formData.data && formData.data['tls.key']}
            onChange={(key: string, value: string) => handleTLSFormChange(key, value)}
          />
        )}
        {formData.type === 'bootstrap.kubernetes.io/token' && (
          <TokenForm
            authExtraGroups={formData.data && formData.data['auth-extra-groups']}
            expiration={formData.data && formData.data['expiration']}
            tokenId={formData.data && formData.data['token-id']}
            tokenSecret={formData.data && formData.data['token-secret']}
            usageBootstrapAuthentication={formData.data && formData.data['usage-bootstrap-authentication']}
            usageBootstrapSigning={formData.data && formData.data['usage-bootstrap-signing']}
            onChange={(key: string, value: string) => handleTokenFormChange(key, value)}
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
  const [localValue, setLocalValue] = useState<string | undefined>(value);
  const [plainValue, setPlainValue] = useState(value ? Buffer.from(value, 'base64').toString('utf-8') : '');
  const [isEncoded, setIsEncoded] = useState(false);

  const handleValueChange = (propertyValue: string) => {
    if (!isEncoded) {
      setLocalValue(propertyValue ? Buffer.from(propertyValue).toString('base64') : undefined);
    } else {
      setLocalValue(propertyValue || undefined);
    }
  };

  useEffect(() => {
    if (_.isEqual(localValue, value)) {
      return;
    }

    if (localValue) {
      setPlainValue(Buffer.from(localValue, 'base64').toString('utf-8'));
    } else {
      setPlainValue('');
    }

    if (onChange) {
      onChange(localValue);
    }
  }, [localValue]);

  return (
    <div style={{width: '100%', marginTop: '16px'}}>
      <StyledSpanTitle>Data</StyledSpanTitle>
      <Base64TextArea value={localValue} onChange={(emittedValue: string) => handleValueChange(emittedValue)} />
    </div>
  );
};

const TLSForm = ({tlscrt, tlskey, onChange}: {tlscrt: string; tlskey: string; onChange: Function}) => {
  const handleValueChange = (key: string, value: string) => {
    if (onChange) {
      onChange(key, value);
    }
  };

  return (
    <div style={{width: '100%', marginTop: '16px'}}>
      <StyledSpanTitle>Data</StyledSpanTitle>
      <div>
        <StyledSpanTitle>CRT</StyledSpanTitle>
        <Base64TextArea
          value={tlscrt}
          onChange={(emittedValue: string) => handleValueChange('tls.crt', emittedValue)}
        />
      </div>
      <div>
        <StyledSpanTitle>Key</StyledSpanTitle>
        <Base64TextArea
          value={tlskey}
          onChange={(emittedValue: string) => handleValueChange('tls.key', emittedValue)}
        />
      </div>
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
  onChange,
}: {
  authExtraGroups: string;
  expiration: string;
  tokenId: string;
  tokenSecret: string;
  usageBootstrapAuthentication: string;
  usageBootstrapSigning: string;
  onChange: Function;
}) => {
  const handleValueChange = (key: string, value: string) => {
    if (onChange) {
      onChange(key, value);
    }
  };

  return (
    <div style={{width: '100%', marginTop: '16px'}}>
      <StyledSpanTitle>Data</StyledSpanTitle>
      <div>
        <StyledSpanTitle>Auth Extra Groups</StyledSpanTitle>
        <Base64Input
          value={authExtraGroups}
          onChange={(emittedValue: string) => handleValueChange('auth-extra-groups', emittedValue)}
        />
      </div>
      <div>
        <StyledSpanTitle>Expiration</StyledSpanTitle>
        <Base64Input
          value={expiration}
          onChange={(emittedValue: string) => handleValueChange('expiration', emittedValue)}
        />
      </div>
      <div>
        <StyledSpanTitle>Token Id</StyledSpanTitle>
        <Base64Input value={tokenId} onChange={(emittedValue: string) => handleValueChange('token-id', emittedValue)} />
      </div>
      <div>
        <StyledSpanTitle>Token Secret</StyledSpanTitle>
        <Base64Input
          value={tokenSecret}
          onChange={(emittedValue: string) => handleValueChange('token-secret', emittedValue)}
        />
      </div>
      <div>
        <StyledSpanTitle>Usage Bootstrap Authentication</StyledSpanTitle>
        <Base64Input
          value={usageBootstrapAuthentication}
          onChange={(emittedValue: string) => handleValueChange('usage-bootstrap-authentication', emittedValue)}
        />
      </div>
      <div>
        <StyledSpanTitle>Usage Bootstrap Signing</StyledSpanTitle>
        <Base64Input
          value={usageBootstrapSigning}
          onChange={(emittedValue: string) => handleValueChange('usage-bootstrap-signing', emittedValue)}
        />
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
      setLocalValue({id: localValue.id, key: localValue.key, value: propertyValue || undefined});
    }
  };

  const handleDeleteValue = () => {
    if (onDelete) {
      onDelete(localValue);
    }
  };

  useEffect(() => {
    if (_.isEqual(localValue, value)) {
      return;
    }

    if (onChange && (localValue.key || localValue.value)) {
      onChange(localValue);
    }
  }, [localValue]);

  return (
    <div style={{display: 'flex', alignItems: 'space-between', width: '100%', marginTop: '16px'}}>
      <div style={{width: '40%', marginRight: '0.33%'}}>
        <StyledSpanTitle>Key</StyledSpanTitle>
        <Input value={localValue.key} onChange={event => handleValueChange('KEY', event.target.value)} />
      </div>
      <div style={{width: '40%', marginLeft: '0.33%'}}>
        <StyledSpanTitle>Value</StyledSpanTitle>
        <Base64Input
          value={localValue.value}
          onChange={(emittedValue: string) => handleValueChange('VALUE', emittedValue)}
        />
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

export const Base64Input = ({value, onChange}: any) => {
  const [localValue, setLocalValue] = useState<string | undefined>(value);
  const [plainValue, setPlainValue] = useState(value ? Buffer.from(value, 'base64').toString('utf-8') : '');
  const [isEncoded, setIsEncoded] = useState(false);

  const handleValueChange = (propertyValue: string) => {
    if (!isEncoded) {
      setLocalValue(propertyValue ? Buffer.from(propertyValue).toString('base64') : undefined);
    } else {
      setLocalValue(propertyValue || undefined);
    }
  };

  useDebounce(
    () => {
      if (_.isEqual(localValue, value)) {
        return;
      }

      if (localValue) {
        setPlainValue(Buffer.from(localValue, 'base64').toString('utf-8'));
      } else {
        setPlainValue('');
      }

      if (onChange) {
        onChange(localValue);
      }
    },
    DEFAULT_EDITOR_DEBOUNCE,
    [localValue]
  );

  return (
    <>
      <Input value={isEncoded ? localValue : plainValue} onChange={event => handleValueChange(event.target.value)} />
      {isEncoded ? (
        <StyledSpanToggler onClick={() => setIsEncoded(false)}>Encoded</StyledSpanToggler>
      ) : (
        <StyledSpanToggler onClick={() => setIsEncoded(true)}>Decoded</StyledSpanToggler>
      )}
    </>
  );
};

export const Base64TextArea = ({value, onChange}: any) => {
  const [localValue, setLocalValue] = useState<string | undefined>(value);
  const [plainValue, setPlainValue] = useState(value ? Buffer.from(value, 'base64').toString('utf-8') : '');
  const [isEncoded, setIsEncoded] = useState(false);

  const handleValueChange = (propertyValue: string) => {
    if (!isEncoded) {
      setLocalValue(propertyValue ? Buffer.from(propertyValue).toString('base64') : undefined);
    } else {
      setLocalValue(propertyValue || undefined);
    }
  };

  useDebounce(
    () => {
      if (_.isEqual(localValue, value)) {
        return;
      }

      if (localValue) {
        setPlainValue(Buffer.from(localValue, 'base64').toString('utf-8'));
      } else {
        setPlainValue('');
      }

      if (onChange) {
        onChange(localValue);
      }
    },
    DEFAULT_EDITOR_DEBOUNCE,
    [localValue]
  );

  return (
    <>
      <TextArea
        rows={6}
        value={isEncoded ? localValue : plainValue}
        onChange={event => handleValueChange(event.target.value)}
      />
      {isEncoded ? (
        <StyledSpanToggler onClick={() => setIsEncoded(false)}>Encoded</StyledSpanToggler>
      ) : (
        <StyledSpanToggler onClick={() => setIsEncoded(true)}>Decoded</StyledSpanToggler>
      )}
    </>
  );
};
