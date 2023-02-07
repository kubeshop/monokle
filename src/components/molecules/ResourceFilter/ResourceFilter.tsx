import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDebounce} from 'react-use';

import {Select, Tooltip, TreeSelect} from 'antd';

import {isEmpty, isEqual, omit, uniqWith} from 'lodash';

import {DEFAULT_EDITOR_DEBOUNCE, PANE_CONSTRAINT_VALUES, TOOLTIP_DELAY} from '@constants/constants';
import {QuickFilterTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResourceFilter} from '@redux/reducers/main';
import {openFiltersPresetModal} from '@redux/reducers/ui';
import {isInClusterModeSelector, isInPreviewModeSelectorNew} from '@redux/selectors';
import {
  activeResourceCountSelector,
  allResourceAnnotationsSelector,
  allResourceKindsSelector,
  allResourceLabelsSelector,
} from '@redux/selectors/resourceMapSelectors';
import {startClusterConnection} from '@redux/thunks/cluster';

import {useFolderTreeSelectData} from '@hooks/useFolderTreeSelectData';
import {useNamespaces} from '@hooks/useNamespaces';

import {useWindowSize} from '@utils/hooks';

import {Filter, FilterButton, FilterField, FilterHeader, KeyValueInput, NewKeyValueInput} from '@monokle/components';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {ResourceFilterType} from '@shared/models/appState';
import {kubeConfigContextSelector} from '@shared/utils/selectors';

import * as S from './ResourceFilter.styled';

export const NAVIGATOR_FILTER_BODY_HEIGHT = 375;

export type Props = {
  active: boolean;
  onToggle: () => void;
};

const ResourceFilter = ({active, onToggle}: Props) => {
  const dispatch = useAppDispatch();
  const {width: windowWidth} = useWindowSize();

  const [allNamespaces] = useNamespaces({extra: []});
  const isPaneWideEnough = useAppSelector(
    state => windowWidth * state.ui.paneConfiguration.navPane > PANE_CONSTRAINT_VALUES.navPane
  );
  const isFolderOpen = useAppSelector(state => Boolean(state.main.fileMap[ROOT_FILE_ENTRY]));
  const hasAnyActiveResources = useAppSelector(state => activeResourceCountSelector(state) > 0);

  const areFiltersDisabled = useAppSelector(state => Boolean(state.main.checkedResourceIdentifiers.length));
  const fileMap = useAppSelector(state => state.main.fileMap);
  const filtersMap = useAppSelector(state => state.main.resourceFilter);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);

  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const resourceFilterKinds = useAppSelector(state => state.main.resourceFilter.kinds ?? []);

  const allResourceKinds = useAppSelector(allResourceKindsSelector);
  const allResourceLabels = useAppSelector(allResourceLabelsSelector);
  const allResourceAnnotations = useAppSelector(allResourceAnnotationsSelector);

  const [localResourceFilter, setLocalResourceFilter] = useState<ResourceFilterType>(filtersMap);
  const [wasLocalUpdate, setWasLocalUpdate] = useState<boolean>(false);
  const folderTree = useFolderTreeSelectData();
  const autocompleteOptions = useMemo(() => {
    return {
      namespaces:
        uniqWith(
          allNamespaces?.map(n => ({value: n})),
          isEqual
        ) ?? [],
      kinds:
        uniqWith(
          allResourceKinds?.map(n => ({value: n})),
          isEqual
        ) ?? [],
      labels:
        uniqWith(
          Object.keys(allResourceLabels)?.map(n => ({value: n})),
          isEqual
        ) ?? [],
      annotations:
        uniqWith(
          Object.keys(allResourceAnnotations)?.map(n => ({value: n})),
          isEqual
        ) ?? [],
    };
  }, [allNamespaces, allResourceKinds, allResourceLabels, allResourceAnnotations]);

  const isSavePresetDisabled = useMemo(() => {
    return (
      isEmpty(localResourceFilter?.name) &&
      isEmpty(localResourceFilter?.kinds) &&
      isEmpty(localResourceFilter?.namespaces) &&
      isEmpty(localResourceFilter?.labels) &&
      isEmpty(localResourceFilter?.annotations) &&
      (!localResourceFilter?.fileOrFolderContainedIn ||
        localResourceFilter?.fileOrFolderContainedIn === ROOT_FILE_ENTRY)
    );
  }, [localResourceFilter]);

  const appliedFiltersCount = useMemo(
    () =>
      Object.entries(localResourceFilter)
        .map(([key, value]) => {
          return {filterName: key, filterValue: value};
        })
        .filter(filter => filter.filterValue && Object.values(filter.filterValue).length).length,
    [localResourceFilter]
  );

  const hasActiveFilters = appliedFiltersCount > 0;

  const handleChange = useCallback((delta: Partial<any>) => {
    setWasLocalUpdate(true);
    setLocalResourceFilter(prevState => ({...prevState, ...delta}));
  }, []);

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
      name: null,
      kinds: null,
      namespaces: [],
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
        labels: {...localResourceFilter.labels, [key]: value},
      });
    },
    [handleChange, localResourceFilter.labels]
  );

  const handleRemoveLabelFilter = useCallback(
    (key: string) => {
      handleChange({
        labels: omit(localResourceFilter.labels, key),
      });
    },
    [handleChange, localResourceFilter.labels]
  );

  const handleUpsertAnnotationFilter = useCallback(
    ([key, value]: any) => {
      handleChange({
        annotations: {...localResourceFilter.annotations, [key]: value},
      });
    },
    [handleChange, localResourceFilter.annotations]
  );

  const handleRemoveAnnotationFilter = useCallback(
    (key: string) => {
      handleChange({
        annotations: omit(localResourceFilter.annotations, key),
      });
    },
    [handleChange, localResourceFilter.annotations]
  );

  const onClearFileOrFolderContainedInHandler = useCallback(() => {
    handleChange({fileOrFolderContainedIn: null});
  }, [handleChange]);

  const updateFileOrFolderContainedIn = (selectedFileOrFolder: string) => {
    if (!selectedFileOrFolder || !fileMap[selectedFileOrFolder] || selectedFileOrFolder === ROOT_FILE_ENTRY) {
      handleChange({fileOrFolderContainedIn: undefined});
    } else {
      handleChange({fileOrFolderContainedIn: fileMap[selectedFileOrFolder].filePath});
    }
  };

  const onClickLoadPreset = useCallback(() => {
    dispatch(openFiltersPresetModal('load'));
  }, [dispatch]);

  const onClickSavePreset = useCallback(() => {
    dispatch(openFiltersPresetModal('save'));
  }, [dispatch]);

  useDebounce(
    () => {
      if (!wasLocalUpdate) {
        return;
      }

      dispatch(updateResourceFilter(localResourceFilter));

      if (isInClusterMode && !isEqual(resourceFilterKinds, localResourceFilter.kinds)) {
        dispatch(startClusterConnection({context: kubeConfigContext, isRestart: true}));
      }
    },
    DEFAULT_EDITOR_DEBOUNCE,
    [localResourceFilter]
  );

  useEffect(() => {
    if (!wasLocalUpdate) {
      setLocalResourceFilter(filtersMap);
    }
  }, [filtersMap, wasLocalUpdate]);

  useEffect(() => {
    setWasLocalUpdate(false);
  }, [filtersMap]);

  return (
    <S.Container>
      <Filter
        height={NAVIGATOR_FILTER_BODY_HEIGHT}
        search={localResourceFilter?.name}
        onClear={handleClear}
        onSearch={handleSearched}
        active={active}
        hasActiveFilters={hasActiveFilters}
        onToggle={onToggle}
        filterButton={
          <S.Badge count={appliedFiltersCount} size="small" offset={[-4, 4]}>
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={QuickFilterTooltip}>
              <FilterButton
                active={active}
                iconHighlight={hasActiveFilters}
                onClick={onToggle}
                disabled={(!isFolderOpen && !isInClusterMode && !isInPreviewMode) || !hasAnyActiveResources}
              />
            </Tooltip>
          </S.Badge>
        }
        header={
          <FilterHeader
            onClear={handleClear}
            filterActions={
              <>
                <S.FilterActionButton type="text" disabled={isSavePresetDisabled} onClick={onClickSavePreset}>
                  Save {isPaneWideEnough ? 'preset' : ''}
                </S.FilterActionButton>
                <S.FilterActionButton type="text" onClick={onClickLoadPreset}>
                  Load {isPaneWideEnough ? 'preset' : ''}
                </S.FilterActionButton>
              </>
            }
          />
        }
      >
        <FilterField name="Kind">
          <Select
            mode="tags"
            value={localResourceFilter.kinds || []}
            placeholder="Select one or more kinds.."
            options={autocompleteOptions.kinds}
            onChange={onKindChangeHandler}
            onClear={onKindClearHandler}
            style={{width: '100%'}}
          />
        </FilterField>

        <FilterField name="Namespace">
          <Select
            mode="tags"
            style={{width: '100%'}}
            placeholder="Select one or more namespaces.."
            value={localResourceFilter.namespaces}
            options={autocompleteOptions.namespaces}
            onChange={onNamespaceChangeHandler}
            onClear={onNamespaceClearHandler}
            allowClear
          />
        </FilterField>

        <FilterField name="Labels">
          <NewKeyValueInput onAddKeyValue={handleUpsertLabelFilter} keyOptions={autocompleteOptions.labels} />

          {Object.entries(localResourceFilter.labels).map(([key, value]) => {
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

          {Object.entries(localResourceFilter.annotations).map(([key, value]) => {
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
          <TreeSelect
            showSearch
            disabled={isInPreviewMode || areFiltersDisabled}
            value={localResourceFilter.fileOrFolderContainedIn}
            defaultValue={ROOT_FILE_ENTRY}
            onChange={updateFileOrFolderContainedIn}
            treeData={[folderTree]}
            treeDefaultExpandAll
            onClear={onClearFileOrFolderContainedInHandler}
            allowClear
          />
        </FilterField>
      </Filter>
    </S.Container>
  );
};

export default ResourceFilter;
