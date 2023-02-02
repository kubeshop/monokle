import {useCallback, useMemo} from 'react';

import {Select} from 'antd';

import {isEqual, omit} from 'lodash';
import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResourceFilter} from '@redux/reducers/main';
import {isInClusterModeSelector, knownResourceKindsSelector} from '@redux/selectors';
import {restartPreview} from '@redux/services/preview';

import {useNamespaces} from '@hooks/useNamespaces';

import {Filter, FilterField, KeyValueInput, NewKeyValueInput} from '@monokle/components';
import {ROOT_FILE_ENTRY} from '@shared/constants';
import {isInPreviewModeSelector, kubeConfigContextSelector} from '@shared/utils/selectors';

export const NAVIGATOR_FILTER_BODY_HEIGHT = 375;

export type Props = {
  active: boolean;
  onToggle: () => void;
};

const ResourceFilter = ({active, onToggle}: Props) => {
  const dispatch = useAppDispatch();

  const [allNamespaces] = useNamespaces({});

  const areFiltersDisabled = useAppSelector(state => Boolean(state.main.checkedResourceIds.length));
  const fileMap = useAppSelector(state => state.main.fileMap);
  const filtersMap = useAppSelector(state => state.main.resourceFilter);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);

  const knownResourceKinds = useAppSelector(knownResourceKindsSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const resourceFilterKinds = useAppSelector(state => state.main.resourceFilter.kinds ?? []);
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

  const allAnnotationsData = useMemo<Record<string, string[]>>(() => {
    return makeKeyValuesFromObjectList(Object.values(resourceMap), resource => resource.content?.metadata?.annotations);
  }, [resourceMap]);

  const updateFileOrFolderContainedIn = (selectedFileOrFolder: string) => {
    if (selectedFileOrFolder === ROOT_FILE_ENTRY) {
      handleChange({fileOrFolderContainedIn: undefined});
    } else {
      handleChange({fileOrFolderContainedIn: selectedFileOrFolder});
    }
  };

  const autocompleteOptions = useMemo(() => {
    return {
      namespaces: allNamespaces?.map(n => ({value: n})) ?? [],
      kinds: allResourceKinds?.map(n => ({value: n})) ?? [],
      labels: Object.keys(allLabelsData)?.map(n => ({value: n})) ?? [],
      annotations: Object.keys(allAnnotationsData)?.map(n => ({value: n})) ?? [],
      files: Object.keys(fileMap).map(option => ({value: option})) ?? [],
    };
  }, [allNamespaces, allResourceKinds, allLabelsData, allAnnotationsData, fileMap]);

  const hasActiveFilters = useMemo(
    () =>
      Object.entries(filtersMap)
        .map(([key, value]) => {
          return {filterName: key, filterValue: value};
        })
        .filter(filter => filter.filterValue && Object.values(filter.filterValue).length).length > 0,
    [filtersMap]
  );

  const handleChange = useCallback(
    (delta: Partial<any>) => {
      const updatedFilter = {...filtersMap, ...delta};

      dispatch(updateResourceFilter(updatedFilter));

      if (isInClusterMode && !isEqual(resourceFilterKinds, updatedFilter.kinds)) {
        restartPreview(kubeConfigContext, 'cluster', dispatch);
      }
    },
    [dispatch, filtersMap, isInClusterMode, kubeConfigContext, resourceFilterKinds]
  );

  const handleSearched = useCallback(
    (newSearch: string) => {
      handleChange({
        name: newSearch,
      });
    },
    [handleChange]
  );

  const handleClear = useCallback(() => {
    handleChange({
      names: null,
      kinds: null,
      namespaces: null,
      labels: {},
      annotations: {},
      fileOrFolderContainedIn: null,
    });
  }, [handleChange]);

  const onKindChangeHandler = useCallback(
    (selectedKinds: string[]) => {
      handleChange({kinds: selectedKinds});
    },
    [handleChange]
  );

  const onKindClearHandler = useCallback(() => {
    handleChange({kinds: null});
  }, [handleChange]);

  const onNamespaceChangeHandler = useCallback(
    (namespaces: string[]) => {
      handleChange({namespaces});
    },
    [handleChange]
  );

  const onNamespaceClearHandler = useCallback(() => {
    handleChange({namespaces: null});
  }, [handleChange]);

  const handleUpsertLabelFilter = useCallback(
    ([key, value]: any) => {
      handleChange({
        labels: {...filtersMap.labels, [key]: value},
      });
    },
    [handleChange, filtersMap.labels]
  );

  const handleRemoveLabelFilter = useCallback(
    (key: string) => {
      handleChange({
        labels: omit(filtersMap.labels, key),
      });
    },
    [handleChange, filtersMap.labels]
  );

  const handleUpsertAnnotationFilter = useCallback(
    ([key, value]: any) => {
      handleChange({
        annotations: {...filtersMap.annotations, [key]: value},
      });
    },
    [handleChange, filtersMap.annotations]
  );

  const handleRemoveAnnotationFilter = useCallback(
    (key: string) => {
      handleChange({
        annotations: omit(filtersMap.annotations, key),
      });
    },
    [handleChange, filtersMap.annotations]
  );

  const onClearFileOrFolderContainedInHandler = useCallback(() => {
    handleChange({fileOrFolderContainedIn: null});
  }, [handleChange]);

  return (
    <Container>
      <Filter
        height={NAVIGATOR_FILTER_BODY_HEIGHT}
        search={filtersMap?.name}
        onClear={handleClear}
        onSearch={handleSearched}
        active={active}
        hasActiveFilters={hasActiveFilters}
        onToggle={onToggle}
      >
        <FilterField name="Kind">
          <Select
            mode="tags"
            value={filtersMap.kinds || []}
            placeholder="Select one or more kinds.."
            options={autocompleteOptions.kinds}
            onChange={onKindChangeHandler}
            onClear={onKindClearHandler}
            style={{width: '100%'}}
          />
        </FilterField>

        <FilterField name="Namespace">
          <Select
            style={{width: '100%'}}
            placeholder="Select one or more namespaces.."
            value={filtersMap.namespaces}
            options={autocompleteOptions.namespaces}
            onChange={onNamespaceChangeHandler}
            onClear={onNamespaceClearHandler}
            allowClear
          />
        </FilterField>

        <FilterField name="Labels">
          <NewKeyValueInput onAddKeyValue={handleUpsertLabelFilter} keyOptions={autocompleteOptions.labels} />

          {Object.entries(filtersMap.labels).map(([key, value]) => {
            return (
              <KeyValueInput
                key={key}
                pair={[key, String(value || '')]}
                onDelete={handleRemoveLabelFilter}
                onChange={handleUpsertLabelFilter}
              />
            );
          })}
        </FilterField>

        <FilterField name="Annotations">
          <NewKeyValueInput onAddKeyValue={handleUpsertAnnotationFilter} keyOptions={autocompleteOptions.annotations} />

          {Object.entries(filtersMap.annotations).map(([key, value]) => {
            return (
              <KeyValueInput
                key={key}
                pair={[key, String(value || '')]}
                onDelete={handleRemoveAnnotationFilter}
                onChange={handleUpsertAnnotationFilter}
              />
            );
          })}
        </FilterField>

        <FilterField name="Contained in file/folder:">
          <Select
            showSearch
            disabled={isInPreviewMode || areFiltersDisabled}
            value={filtersMap.fileOrFolderContainedIn}
            defaultValue={ROOT_FILE_ENTRY}
            onChange={updateFileOrFolderContainedIn}
            options={autocompleteOptions.files}
            onClear={onClearFileOrFolderContainedInHandler}
            allowClear
          />
        </FilterField>
      </Filter>
    </Container>
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

const Container = styled.div`
  & > div {
    padding: 0 10px !important;
  }
`;
