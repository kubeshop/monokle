import {Button, Input, Select} from 'antd';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDebounce} from 'react-use';
import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResourceFilter} from '@redux/reducers/main';

import {KeyValueInput} from '@components/atoms';

import {useNamespaces} from '@hooks/useNamespaces';

import Colors from '@styles/Colors';

import {ResourceKindHandlers} from '@src/kindhandlers';

const ALL_OPTIONS = '<all>';

const BaseContainer = styled.div`
  min-width: 400px;
`;

const FieldContainer = styled.div`
  margin-top: 5px;
  margin-bottom: 10px;
`;

const FieldLabel = styled.p`
  font-weight: 500;
  margin-bottom: 5px;
`;

const StyledTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledTitleLabel = styled.span`
  color: ${Colors.grey7};
`;

const StyledTitleButton = styled(Button)`
  padding: 0;
`;

const KnownResourceKinds = ResourceKindHandlers.map(kindHandler => kindHandler.kind);

const makeKeyValuesFromObjectList = (objectList: any[], getNestedObject: (currentObject: any) => any) => {
  const keyValues: Record<string, string[]> = {};
  Object.values(objectList).forEach(currentObject => {
    const nestedObject = getNestedObject(currentObject);
    if (nestedObject) {
      Object.entries(nestedObject).forEach(([key, value]) => {
        if (typeof value !== 'string') {
          return;
        }
        if (keyValues[key]) {
          if (!keyValues[key].includes(value)) {
            keyValues[key].push(value);
          }
        } else {
          keyValues[key] = [value];
        }
      });
    }
  });
  return keyValues;
};

const ResourceFilter = () => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState<string>();
  const [kind, setKind] = useState<string>();
  const [namespace, setNamespace] = useState<string>();
  const [labels, setLabels] = useState<Record<string, string | null>>({});
  const [annotations, setAnnotations] = useState<Record<string, string | null>>({});
  const allNamespaces = useNamespaces({extra: ['all', 'default']});
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const filtersMap = useAppSelector(state => state.main.resourceFilter);

  const allResourceKinds = useMemo(() => {
    return [
      ...new Set([
        ...KnownResourceKinds,
        ...Object.values(resourceMap)
          .filter(r => !KnownResourceKinds.includes(r.kind))
          .map(r => r.kind),
      ]),
    ].sort();
  }, [resourceMap]);

  const getAllLabels = useCallback(() => {
    const allLabels: Record<string, string[]> = makeKeyValuesFromObjectList(
      Object.values(resourceMap),
      resource => resource.content?.metadata?.labels
    );
    return allLabels;
  }, [resourceMap]);

  const getAllAnnotations = useCallback(() => {
    const allAnnotations: Record<string, string[]> = makeKeyValuesFromObjectList(
      Object.values(resourceMap),
      resource => resource.content?.metadata?.annotations
    );
    return allAnnotations;
  }, [resourceMap]);

  const resetFilters = () => {
    setName('');
    setKind(ALL_OPTIONS);
    setNamespace(ALL_OPTIONS);
    setLabels({});
    setAnnotations({});
  };

  const updateKind = (selectedKind: string) => {
    if (selectedKind === ALL_OPTIONS) {
      setKind(undefined);
    } else {
      setKind(selectedKind);
    }
  };

  const updateNamespace = (selectedNamespace: string) => {
    if (selectedNamespace === ALL_OPTIONS) {
      setNamespace(undefined);
    } else {
      setNamespace(selectedNamespace);
    }
  };

  useDebounce(
    () => {
      const updatedFilter = {
        name,
        kind: kind === ALL_OPTIONS ? undefined : kind,
        namespace: namespace === ALL_OPTIONS ? undefined : namespace,
        labels,
        annotations,
      };
      dispatch(updateResourceFilter(updatedFilter));
    },
    500,
    [name, kind, namespace, labels, annotations]
  );

  useEffect(() => {
    setNamespace(filtersMap.namespace);
  }, [filtersMap]);

  return (
    <BaseContainer>
      <StyledTitleContainer>
        <StyledTitleLabel>Filter resources by:</StyledTitleLabel>
        <StyledTitleButton type="link" onClick={resetFilters}>
          Reset all
        </StyledTitleButton>
      </StyledTitleContainer>
      <FieldContainer>
        <FieldLabel>Name:</FieldLabel>
        <Input
          autoFocus
          placeholder="All or part of name..."
          defaultValue={name}
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </FieldContainer>
      <FieldContainer>
        <FieldLabel>Kind:</FieldLabel>
        <Select
          showSearch
          defaultValue={ALL_OPTIONS}
          value={kind || ALL_OPTIONS}
          onChange={updateKind}
          style={{width: '100%'}}
        >
          <Select.Option key={ALL_OPTIONS} value={ALL_OPTIONS}>
            {ALL_OPTIONS}
          </Select.Option>
          {allResourceKinds.map(resourceKind => (
            <Select.Option key={resourceKind} value={resourceKind}>
              {resourceKind}
            </Select.Option>
          ))}
        </Select>
      </FieldContainer>
      <FieldContainer>
        <FieldLabel>Namespace:</FieldLabel>
        <Select
          showSearch
          defaultValue={ALL_OPTIONS}
          value={namespace || ALL_OPTIONS}
          onChange={updateNamespace}
          style={{width: '100%'}}
        >
          {allNamespaces.map(ns => (
            <Select.Option key={ns} value={ns}>
              {ns}
            </Select.Option>
          ))}
        </Select>
      </FieldContainer>
      <FieldContainer>
        <KeyValueInput label="Labels:" data={getAllLabels()} value={labels} onChange={setLabels} />
      </FieldContainer>
      <FieldContainer>
        <KeyValueInput label="Annotations:" data={getAllAnnotations()} value={annotations} onChange={setAnnotations} />
      </FieldContainer>
    </BaseContainer>
  );
};

export default ResourceFilter;
