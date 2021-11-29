import React, {useEffect, useState} from 'react';

import {Select} from 'antd';

import {K8sResource} from '@models/k8sresource';

import {useAppSelector} from '@redux/hooks';

const Option = Select.Option;

export const SecretKindSelection = ({schema, onChange, formData, disabled}: any) => {
  const {secretType} = schema;
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const [refs, setRefs] = useState<string[]>([]);
  const [properties, setProperties] = useState<string[]>([]);
  const [selectedRef, setSelectedRef] = useState<string | undefined>(formData.name);
  const [selectedProperty, setSelectedProperty] = useState<string | undefined>(formData.key);

  useEffect(() => {
    if (resourceMap) {
      setRefs(
        Object.values(resourceMap)
          .filter((resource: K8sResource) => resource.kind === 'Secret')
          .map((resource: K8sResource) => resource.name)
      );
    } else {
      setRefs([]);
    }
  }, [resourceMap]);

  useEffect(() => {
    if (resourceMap && selectedRef) {
      const selectedResource: K8sResource | undefined = Object.values(resourceMap).find(
        (resource: K8sResource) => resource.kind === 'Secret' && resource.name === selectedRef
      );
      setProperties(selectedResource ? Object.keys(selectedResource.content.data) : []);
    } else {
      setProperties([]);
    }
  }, [selectedRef, resourceMap]);

  useEffect(() => {
    onChange({name: selectedRef, key: selectedProperty});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRef, selectedProperty]);

  const onRefChange = (value: string) => {
    setSelectedRef(value);
  };

  const onPropertyChange = (value: string) => {
    setSelectedProperty(value);
  };

  // console.log(secretType, formData, disabled);
  return (
    <div>
      <Select value={selectedRef} onChange={onRefChange} disabled={disabled}>
        {refs.map(ref => (
          <Option value={ref}>{ref}</Option>
        ))}
      </Select>
      <Select value={selectedProperty} onChange={onPropertyChange} disabled={disabled}>
        {properties.map(property => (
          <Option value={property}>{property}</Option>
        ))}
      </Select>
    </div>
  );
};
