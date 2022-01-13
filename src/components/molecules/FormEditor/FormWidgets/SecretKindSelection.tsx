import React, {useEffect, useMemo, useState} from 'react';

import {Select} from 'antd';

import styled from 'styled-components';

import {K8sResource} from '@models/k8sresource';

import {useAppSelector} from '@redux/hooks';

const Option = Select.Option;

const FormContainer = styled.div`
  display: flex;
  margin-top: 16px;
`;

export const SecretKindSelection = ({schema, onChange, formData, disabled}: any) => {
  const {secretType} = schema;
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const [refs, setRefs] = useState<string[]>([]);
  const [properties, setProperties] = useState<string[]>([]);
  const [selectedRef, setSelectedRef] = useState<string | undefined>(
    secretType === 'Opaque' ? formData?.name : formData
  );
  const [selectedProperty, setSelectedProperty] = useState<string | undefined>(
    secretType === 'Opaque' ? formData?.key : undefined
  );

  const allowedSecretTypes = useMemo(() => {
    if (secretType === 'Opaque') {
      return ['Opaque'];
    }
    if (secretType === 'PullSecret') {
      return ['kubernetes.io/dockerconfigjson', 'kubernetes.io/dockercfg'];
    }
    return [];
  }, [secretType]);

  useEffect(() => {
    if (resourceMap) {
      setRefs(
        Object.values(resourceMap)
          .filter(
            (resource: K8sResource) => resource.kind === 'Secret' && allowedSecretTypes.includes(resource.content.type)
          )
          .map((resource: K8sResource) => resource.name)
      );
    } else {
      setRefs([]);
    }
  }, [resourceMap, allowedSecretTypes]);

  useEffect(() => {
    if (secretType === 'Opaque' && resourceMap && selectedRef) {
      const selectedResource: K8sResource | undefined = Object.values(resourceMap).find(
        (resource: K8sResource) => resource.kind === 'Secret' && resource.name === selectedRef
      );
      setProperties(selectedResource ? Object.keys(selectedResource.content.data) : []);
    } else {
      setProperties([]);
    }
  }, [selectedRef, resourceMap, secretType]);

  useEffect(() => {
    if (secretType === 'Opaque') {
      onChange({name: selectedRef, key: selectedProperty});
    }

    if (secretType === 'PullSecret') {
      onChange(selectedRef);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRef, selectedProperty]);

  const onRefChange = (providedValue: string) => {
    setSelectedRef(providedValue);
    setSelectedProperty(undefined);
  };

  const onPropertyChange = (providedValue: string) => {
    setSelectedProperty(providedValue);
  };

  return (
    <FormContainer>
      <Select
        style={{marginRight: secretType === 'Opaque' ? '4px' : 'opx'}}
        value={selectedRef}
        onChange={onRefChange}
        disabled={disabled}
      >
        {refs.map(ref => (
          <Option key={ref} value={ref}>
            {ref}
          </Option>
        ))}
      </Select>
      {secretType === 'Opaque' && (
        <Select style={{marginLeft: '4px'}} value={selectedProperty} onChange={onPropertyChange} disabled={disabled}>
          {properties.map(property => (
            <Option key={property} value={property}>
              {property}
            </Option>
          ))}
        </Select>
      )}
    </FormContainer>
  );
};
