import {useEffect, useMemo, useState} from 'react';
import {useDebounce} from 'react-use';

import {Button, Input, Select} from 'antd';

import {mapValues} from 'lodash';

import {DEFAULT_EDITOR_DEBOUNCE} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResourceFilter} from '@redux/reducers/main';
import {openFiltersPresetModal} from '@redux/reducers/ui';
import {knownResourceKindsSelector} from '@redux/selectors';

import {KeyValueInput} from '@components/atoms';

import {useNamespaces} from '@hooks/useNamespaces';

import * as S from './ResourceFilter.styled';

const ALL_OPTIONS = '<all>';
const ROOT_OPTIONS = '<root>';

const {Option} = Select;

const ResourceFilter = () => {
  const dispatch = useAppDispatch();

  const [annotations, setAnnotations] = useState<Record<string, string | null>>({});
  const [fileOrFolderContainedIn, setFileOrFolderContainedIn] = useState<string>();
  const [labels, setLabels] = useState<Record<string, string | null>>({});
  const [kinds, setKinds] = useState<string[]>([ALL_OPTIONS]);
  const [name, setName] = useState<string>();
  const [namespace, setNamespace] = useState<string>();
  const [wasLocalUpdate, setWasLocalUpdate] = useState<boolean>(false);

  const [allNamespaces] = useNamespaces({extra: ['all', 'default']});

  const knownResourceKinds = useAppSelector(knownResourceKindsSelector);
  const areFiltersDisabled = useAppSelector(
    state => Boolean(state.main.checkedResourceIds.length) || Boolean(state.main.clusterDiff.selectedMatches.length)
  );
  const fileMap = useAppSelector(state => state.main.fileMap);
  const filtersMap = useAppSelector(state => state.main.resourceFilter);
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  const allResourceKinds = useMemo(() => {
    return [
      ...new Set([
        ...knownResourceKinds,
        ...Object.values(resourceMap)
          .filter(r => !knownResourceKinds.includes(r.kind))
          .map(r => r.kind),
      ]),
    ].sort();
  }, [knownResourceKinds, resourceMap]);

  const allLabelsData = useMemo<Record<string, string[]>>(() => {
    return makeKeyValuesFromObjectList(Object.values(resourceMap), resource => resource.content?.metadata?.labels);
  }, [resourceMap]);
  const allLabelsSchema = useMemo(() => mapValues(allLabelsData, () => 'string'), [allLabelsData]);

  const allAnnotationsData = useMemo<Record<string, string[]>>(() => {
    return makeKeyValuesFromObjectList(Object.values(resourceMap), resource => resource.content?.metadata?.annotations);
  }, [resourceMap]);
  const allAnnotationsSchema = useMemo(() => mapValues(allAnnotationsData, () => 'string'), [allAnnotationsData]);

  const fileOrFolderContainedInOptions = useMemo(() => {
    return Object.keys(fileMap).map(option => (
      <Option key={option} value={option}>
        {option}
      </Option>
    ));
  }, [fileMap]);

  const resetFilters = () => {
    setWasLocalUpdate(true);
    setName('');
    setKinds([ALL_OPTIONS]);
    setNamespace(ALL_OPTIONS);
    setLabels({});
    setAnnotations({});
    setFileOrFolderContainedIn(ROOT_OPTIONS);
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

  const updateKinds = (selectedKinds: string[]) => {
    setWasLocalUpdate(true);
    if (selectedKinds.length > 1) {
      if (!kinds.includes(ALL_OPTIONS) && selectedKinds.includes(ALL_OPTIONS)) {
        setKinds([ALL_OPTIONS]);
      } else {
        setKinds(selectedKinds.filter(kind => kind !== ALL_OPTIONS));
      }
      return;
    }
    setKinds(selectedKinds);
  };

  const updateNamespace = (selectedNamespace: string) => {
    setWasLocalUpdate(true);
    if (selectedNamespace === ALL_OPTIONS) {
      setNamespace(undefined);
    } else {
      setNamespace(selectedNamespace);
    }
  };

  const updateFileOrFolderContainedIn = (selectedFileOrFolder: string) => {
    setWasLocalUpdate(true);
    if (selectedFileOrFolder === ALL_OPTIONS) {
      setFileOrFolderContainedIn(undefined);
    } else {
      setFileOrFolderContainedIn(selectedFileOrFolder);
    }
  };

  const onClickLoadPreset = () => {
    dispatch(openFiltersPresetModal('load'));
  };

  const onClickSavePreset = () => {
    dispatch(openFiltersPresetModal('save'));
  };

  useDebounce(
    () => {
      if (!wasLocalUpdate) {
        return;
      }

      const updatedFilter = {
        name,
        kinds: kinds.includes(ALL_OPTIONS) ? undefined : kinds,
        namespace: namespace === ALL_OPTIONS ? undefined : namespace,
        labels,
        annotations,
        fileOrFolderContainedIn: fileOrFolderContainedIn === ROOT_OPTIONS ? undefined : fileOrFolderContainedIn,
      };

      dispatch(updateResourceFilter(updatedFilter));
    },
    DEFAULT_EDITOR_DEBOUNCE,
    [name, kinds, namespace, labels, annotations, fileOrFolderContainedIn]
  );

  useEffect(() => {
    if (!wasLocalUpdate) {
      setName(filtersMap.name);
      setKinds(filtersMap.kinds || [ALL_OPTIONS]);
      setNamespace(filtersMap.namespace);
      setLabels(filtersMap.labels);
      setAnnotations(filtersMap.annotations);
      setFileOrFolderContainedIn(filtersMap.fileOrFolderContainedIn);
    }
  }, [wasLocalUpdate, filtersMap]);

  useEffect(() => {
    setWasLocalUpdate(false);
  }, [filtersMap]);

  return (
    <S.Container>
      <S.PresetContainer>
        <Button type="default" onClick={onClickLoadPreset}>
          Load preset
        </Button>
        <Button type="default" onClick={onClickSavePreset}>
          Save preset
        </Button>
      </S.PresetContainer>

      <S.Title>
        <S.TitleLabel>Filter resources by:</S.TitleLabel>
        <S.TitleButton type="link" onClick={resetFilters} disabled={areFiltersDisabled}>
          Reset all
        </S.TitleButton>
      </S.Title>

      <S.Field>
        <S.FieldLabel>Name:</S.FieldLabel>
        <Input
          autoFocus
          disabled={areFiltersDisabled}
          placeholder="All or part of name..."
          defaultValue={name}
          value={name}
          onChange={e => updateName(e.target.value)}
        />
      </S.Field>

      <S.Field>
        <S.FieldLabel>Kind:</S.FieldLabel>
        <Select
          mode="multiple"
          showSearch
          disabled={areFiltersDisabled}
          defaultValue={[ALL_OPTIONS]}
          value={kinds || [ALL_OPTIONS]}
          onChange={updateKinds}
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
      </S.Field>

      <S.Field>
        <S.FieldLabel>Namespace:</S.FieldLabel>
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
      </S.Field>

      <S.Field>
        <KeyValueInput
          label="Labels:"
          schema={allLabelsSchema}
          availableValuesByKey={allLabelsData}
          value={labels}
          onChange={updateLabels}
          disabled={areFiltersDisabled}
        />
      </S.Field>

      <S.Field>
        <KeyValueInput
          disabled={areFiltersDisabled}
          label="Annotations:"
          schema={allAnnotationsSchema}
          availableValuesByKey={allAnnotationsData}
          value={annotations}
          onChange={updateAnnotations}
        />
      </S.Field>

      <S.Field>
        <S.FieldLabel>Contained in file/folder:</S.FieldLabel>
        <Select
          defaultValue={ROOT_OPTIONS}
          disabled={areFiltersDisabled}
          showSearch
          style={{width: '100%'}}
          value={fileOrFolderContainedIn || ROOT_OPTIONS}
          onChange={updateFileOrFolderContainedIn}
        >
          {fileOrFolderContainedInOptions}
        </Select>
      </S.Field>
    </S.Container>
  );
};

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

export default ResourceFilter;
