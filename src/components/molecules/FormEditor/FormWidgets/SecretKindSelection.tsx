import React, {useEffect, useMemo, useState} from 'react';

import {Select} from 'antd';

import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';
import {localResourceMapSelector} from '@redux/selectors/resourceMapSelectors';

import {K8sResource} from '@shared/models/k8sResource';

import * as S from './styled';

const Option = Select.Option;

const FormContainer = styled.div`
  display: flex;
  margin-top: 16px;
`;

export const SecretKindSelection = ({schema, onChange, formData, disabled}: any) => {
  const {secretType} = schema;
  const resourceMap = useAppSelector(localResourceMapSelector);
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
            (resource: K8sResource) => resource.kind === 'Secret' && allowedSecretTypes.includes(resource.object.type)
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
      setProperties(selectedResource ? Object.keys(selectedResource.object.data) : []);
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
