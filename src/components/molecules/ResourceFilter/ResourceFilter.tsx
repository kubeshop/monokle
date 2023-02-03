import {useCallback, useMemo} from 'react';

import {Select} from 'antd';

import {isEqual, omit} from 'lodash';
import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResourceFilter} from '@redux/reducers/main';
import {isInClusterModeSelector, isInPreviewModeSelectorNew} from '@redux/selectors';
import {knownResourceKindsSelector} from '@redux/selectors/resourceKindSelectors';
import {
  activeResourceMetaMapSelector,
  allResourceAnnotationsSelector,
  allResourceKindsSelector,
  allResourceLabelsSelector,
} from '@redux/selectors/resourceMapSelectors';
import {getNamespaces} from '@redux/services/resource';
import {startClusterConnection} from '@redux/thunks/cluster';

import {Filter, FilterField, KeyValueInput, NewKeyValueInput} from '@monokle/components';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {kubeConfigContextSelector} from '@shared/utils/selectors';

export const NAVIGATOR_FILTER_BODY_HEIGHT = 375;

export type Props = {
  active: boolean;
  onToggle: () => void;
};

const ResourceFilter = ({active, onToggle}: Props) => {
  const dispatch = useAppDispatch();

  const allNamespaces = useAppSelector(state => getNamespaces(activeResourceMetaMapSelector(state)));

  const areFiltersDisabled = useAppSelector(state => Boolean(state.main.checkedResourceIdentifiers.length));
  const fileMap = useAppSelector(state => state.main.fileMap);
  const filtersMap = useAppSelector(state => state.main.resourceFilter);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);

  const knownResourceKinds = useAppSelector(knownResourceKindsSelector);

  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const resourceFilterKinds = useAppSelector(state => state.main.resourceFilter.kinds ?? []);

  const allResourceKinds = useAppSelector(allResourceKindsSelector);
  const allResourceLabels = useAppSelector(allResourceLabelsSelector);
  const allResourceAnnotations = useAppSelector(allResourceAnnotationsSelector);

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
      labels: Object.keys(allResourceLabels)?.map(n => ({value: n})) ?? [],
      annotations: Object.keys(allResourceAnnotations)?.map(n => ({value: n})) ?? [],
      files: Object.keys(fileMap).map(option => ({value: option})) ?? [],
    };
  }, [allNamespaces, allResourceKinds, allResourceLabels, allResourceAnnotations, fileMap]);

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
        dispatch(startClusterConnection({context: kubeConfigContext, isRestart: true}));
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

export default ResourceFilter;

const Container = styled.div`
  & > div {
    padding: 0 10px !important;
  }
`;
