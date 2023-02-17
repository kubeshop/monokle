import React, {useEffect, useMemo, useState} from 'react';

import {Select} from 'antd';

import styled from 'styled-components';

import {useResourceContentMapRef, useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';

import {ResourceMeta} from '@shared/models/k8sResource';

import * as S from './styled';

const Option = Select.Option;

const FormContainer = styled.div`
  display: flex;
  margin-top: 16px;
`;

export const SecretKindSelection = ({schema, onChange, formData, disabled}: any) => {
  const {secretType} = schema;
  const resourceMetaMap = useResourceMetaMap('local');
  const resourceContentMapRef = useResourceContentMapRef('local');
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
    if (resourceMetaMap) {
      setRefs(
        Object.values(resourceMetaMap)
          .filter(resourceMeta => {
            const content = resourceContentMapRef.current[resourceMeta.id];

            return resourceMeta.kind === 'Secret' && content && allowedSecretTypes.includes(content.object.type);
          })
          .map(resourceMeta => resourceMeta.name)
      );
    } else {
      setRefs([]);
    }
  }, [resourceMetaMap, allowedSecretTypes, resourceContentMapRef]);

  useEffect(() => {
    if (secretType === 'Opaque' && resourceMetaMap && selectedRef) {
      const selectedResource: ResourceMeta | undefined = Object.values(resourceMetaMap).find(
        resource => resource.kind === 'Secret' && resource.name === selectedRef
      );
      const content = selectedResource ? resourceContentMapRef.current[selectedResource.id] : undefined;
      setProperties(content ? Object.keys(content.object.data) : []);
    } else {
      setProperties([]);
    }
  }, [selectedRef, resourceMetaMap, secretType, resourceContentMapRef]);

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
      <S.SelectStyled
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
      </S.SelectStyled>
      {secretType === 'Opaque' && (
        <S.SelectStyled
          style={{marginLeft: '4px'}}
          value={selectedProperty}
          onChange={onPropertyChange}
          disabled={disabled}
        >
          {properties.map(property => (
            <Option key={property} value={property}>
              {property}
            </Option>
          ))}
        </S.SelectStyled>
      )}
    </FormContainer>
  );
};
