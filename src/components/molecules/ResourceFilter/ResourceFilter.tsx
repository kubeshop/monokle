import {useEffect, useMemo, useState} from 'react';
import {useDebounce} from 'react-use';

import {Button, Input, Select} from 'antd';

import styled from 'styled-components';

import {DEFAULT_EDITOR_DEBOUNCE} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResourceFilter} from '@redux/reducers/main';

import {KeyValueInput} from '@components/atoms';

import {useNamespaces} from '@hooks/useNamespaces';

import Colors from '@styles/Colors';

import {ResourceKindHandlers} from '@src/kindhandlers';

const ALL_OPTIONS = '<all>';

const BaseContainer = styled.div`
  min-width: 250px;
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

const {Option} = Select;

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

  const [annotations, setAnnotations] = useState<Record<string, string | null>>({});
  const [labels, setLabels] = useState<Record<string, string | null>>({});
  const [kind, setKind] = useState<string>();
  const [name, setName] = useState<string>();
  const [namespace, setNamespace] = useState<string>();
  const [wasLocalUpdate, setWasLocalUpdate] = useState<boolean>(false);

  const [allNamespaces] = useNamespaces({extra: ['all', 'default']});

  const filtersMap = useAppSelector(state => state.main.resourceFilter);
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  const areFiltersDisabled = useAppSelector(
    state => Boolean(state.main.checkedResourceIds.length) || Boolean(state.main.clusterDiff.selectedMatches.length)
  );

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

  const allLabels = useMemo<Record<string, string[]>>(() => {
    return makeKeyValuesFromObjectList(Object.values(resourceMap), resource => resource.content?.metadata?.labels);
  }, [resourceMap]);

  const allAnnotations = useMemo<Record<string, string[]>>(() => {
    return makeKeyValuesFromObjectList(Object.values(resourceMap), resource => resource.content?.metadata?.annotations);
  }, [resourceMap]);

  const resetFilters = () => {
    setWasLocalUpdate(true);
    setName('');
    setKind(ALL_OPTIONS);
    setNamespace(ALL_OPTIONS);
    setLabels({});
    setAnnotations({});
  };

  const updateName = (newName: string) => {
    setWasLocalUpdate(true);
    setName(newName);
  };

  const updateLabels = (newLabels: Record<string, string | null>) => {
    setWasLocalUpdate(true);
    setLabels(newLabels);
  };
  const updateAnnotations = (newAnnotations: Record<string, string | null>) => {
    setWasLocalUpdate(true);
    setAnnotations(newAnnotations);
  };

  const updateKind = (selectedKind: string) => {
    setWasLocalUpdate(true);
    if (selectedKind === ALL_OPTIONS) {
      setKind(undefined);
    } else {
      setKind(selectedKind);
    }
  };

  const updateNamespace = (selectedNamespace: string) => {
    setWasLocalUpdate(true);
    if (selectedNamespace === ALL_OPTIONS) {
      setNamespace(undefined);
    } else {
      setNamespace(selectedNamespace);
    }
  };

  useDebounce(
    () => {
      if (!wasLocalUpdate) {
        return;
      }
      const updatedFilter = {
        name,
        kind: kind === ALL_OPTIONS ? undefined : kind,
        namespace: namespace === ALL_OPTIONS ? undefined : namespace,
        labels,
        annotations,
      };
      dispatch(updateResourceFilter(updatedFilter));
    },
    DEFAULT_EDITOR_DEBOUNCE,
    [name, kind, namespace, labels, annotations]
  );

  useEffect(() => {
    if (!wasLocalUpdate) {
      setName(filtersMap.name);
      setKind(filtersMap.kind);
      setNamespace(filtersMap.namespace);
      setLabels(filtersMap.labels);
      setAnnotations(filtersMap.annotations);
    }
  }, [wasLocalUpdate, filtersMap]);

  useEffect(() => {
    setWasLocalUpdate(false);
  }, [filtersMap]);

  return (
    <BaseContainer>
      <StyledTitleContainer>
        <StyledTitleLabel>Filter resources by:</StyledTitleLabel>
        <StyledTitleButton type="link" onClick={resetFilters} disabled={areFiltersDisabled}>
          Reset all
        </StyledTitleButton>
      </StyledTitleContainer>
      <FieldContainer>
        <FieldLabel>Name:</FieldLabel>
        <Input
          autoFocus
          disabled={areFiltersDisabled}
          placeholder="All or part of name..."
          defaultValue={name}
          value={name}
          onChange={e => updateName(e.target.value)}
        />
      </FieldContainer>
      <FieldContainer>
        <FieldLabel>Kind:</FieldLabel>
        <Select
          showSearch
          disabled={areFiltersDisabled}
          defaultValue={ALL_OPTIONS}
          value={kind || ALL_OPTIONS}
          onChange={updateKind}
          style={{width: '100%'}}
        >
          <Option key={ALL_OPTIONS} value={ALL_OPTIONS}>
            {ALL_OPTIONS}
          </Option>
          {allResourceKinds.map(resourceKind => (
            <Option key={resourceKind} value={resourceKind}>
              {resourceKind}
            </Option>
          ))}
        </Select>
      </FieldContainer>
      <FieldContainer>
        <FieldLabel>Namespace:</FieldLabel>
        <Select
          showSearch
          disabled={areFiltersDisabled}
          defaultValue={ALL_OPTIONS}
          value={namespace || ALL_OPTIONS}
          onChange={updateNamespace}
          style={{width: '100%'}}
        >
          {allNamespaces.map(ns => {
            if (typeof ns !== 'string') {
              return null;
            }

            return (
              <Option key={ns} value={ns}>
                {ns}
              </Option>
            );
          })}
        </Select>
      </FieldContainer>
      <FieldContainer>
        <KeyValueInput
          label="Labels:"
          data={allLabels}
          value={labels}
          onChange={updateLabels}
          disabled={areFiltersDisabled}
        />
      </FieldContainer>
      <FieldContainer>
        <KeyValueInput
          disabled={areFiltersDisabled}
          label="Annotations:"
          data={allAnnotations}
          value={annotations}
          onChange={updateAnnotations}
        />
      </FieldContainer>
    </BaseContainer>
  );
};

export default ResourceFilter;
