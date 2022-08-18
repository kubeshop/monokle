import {useEffect, useMemo, useState} from 'react';
import {useDebounce} from 'react-use';

import {Button, Select, Tooltip} from 'antd';

import {ClearOutlined} from '@ant-design/icons';

import {isEmpty, mapValues} from 'lodash';

import {DEFAULT_EDITOR_DEBOUNCE, PANE_CONSTRAINT_VALUES} from '@constants/constants';
import {ResetFiltersTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResourceFilter} from '@redux/reducers/main';
import {openFiltersPresetModal, toggleResourceFilters} from '@redux/reducers/ui';
import {isInPreviewModeSelector, knownResourceKindsSelector} from '@redux/selectors';

import {KeyValueInput} from '@atoms';

import {useNamespaces} from '@hooks/useNamespaces';

import {useWindowSize} from '@utils/hooks';

import InputTags from '../InputTags';
import * as S from './ResourceFilter.styled';

const ALL_OPTIONS = '<all>';
const ROOT_OPTIONS = '<root>';

const {Option} = Select;

const ResourceFilter = () => {
  const dispatch = useAppDispatch();

  const [annotations, setAnnotations] = useState<Record<string, string | null>>({});
  const [fileOrFolderContainedIn, setFileOrFolderContainedIn] = useState<string>();
  const [labels, setLabels] = useState<Record<string, string | null>>({});
  const [kinds, setKinds] = useState<string[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [namespace, setNamespace] = useState<string>();
  const [wasLocalUpdate, setWasLocalUpdate] = useState<boolean>(false);

  const {width: windowWidth} = useWindowSize();

  const [allNamespaces] = useNamespaces({extra: ['all', 'default']});

  const areFiltersDisabled = useAppSelector(
    state => Boolean(state.main.checkedResourceIds.length) || Boolean(state.main.clusterDiff.selectedMatches.length)
  );
  const fileMap = useAppSelector(state => state.main.fileMap);
  const filtersMap = useAppSelector(state => state.main.resourceFilter);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const isPaneWideEnough = useAppSelector(
    state => windowWidth * state.ui.paneConfiguration.navPane > PANE_CONSTRAINT_VALUES.navPane
  );
  const knownResourceKinds = useAppSelector(knownResourceKindsSelector);
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

  const isSavePresetDisabled = useMemo(
    () =>
      !names.length &&
      !kinds.length &&
      (!namespace || namespace === ALL_OPTIONS) &&
      isEmpty(labels) &&
      isEmpty(annotations) &&
      (!fileOrFolderContainedIn || fileOrFolderContainedIn === ROOT_OPTIONS),
    [annotations, fileOrFolderContainedIn, kinds.length, labels, names, namespace]
  );

  const resetFilters = () => {
    setWasLocalUpdate(true);
    setNames([]);
    setKinds([]);
    setNamespace(ALL_OPTIONS);
    setLabels({});
    setAnnotations({});
    setFileOrFolderContainedIn(ROOT_OPTIONS);
  };

  const updateNames = (newName: string, type: 'add' | 'remove') => {
    setWasLocalUpdate(true);

    if (type === 'add') {
      setNames([...names, newName]);
    } else if (type === 'remove') {
      setNames(names.filter(name => name !== newName));
    }
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
        names,
        kinds: kinds.includes(ALL_OPTIONS) ? undefined : kinds,
        namespace: namespace === ALL_OPTIONS ? undefined : namespace,
        labels,
        annotations,
        fileOrFolderContainedIn: fileOrFolderContainedIn === ROOT_OPTIONS ? undefined : fileOrFolderContainedIn,
      };

      dispatch(updateResourceFilter(updatedFilter));
    },
    DEFAULT_EDITOR_DEBOUNCE,
    [names, kinds, namespace, labels, annotations, fileOrFolderContainedIn]
  );

  useEffect(() => {
    if (!wasLocalUpdate) {
      setNames(filtersMap.names || []);
      setKinds(filtersMap.kinds || []);
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
      <S.TitleContainer>
        <S.TitleLabel>
          FILTER <S.CaretUpOutlined onClick={() => dispatch(toggleResourceFilters())} />
        </S.TitleLabel>

        <S.TitleActions>
          <S.PresetButton type="link" onClick={onClickLoadPreset}>
            Load {isPaneWideEnough ? 'preset' : ''}
          </S.PresetButton>
          <S.PresetButton disabled={isSavePresetDisabled} type="link" onClick={onClickSavePreset}>
            Save {isPaneWideEnough ? 'preset' : ''}
          </S.PresetButton>

          <Tooltip title={ResetFiltersTooltip}>
            <Button
              disabled={areFiltersDisabled}
              icon={<ClearOutlined />}
              size="small"
              type="link"
              onClick={resetFilters}
            />
          </Tooltip>
        </S.TitleActions>
      </S.TitleContainer>

      <S.Field>
        <S.FieldLabel>Name(s):</S.FieldLabel>

        <InputTags
          autoFocus
          disabled={areFiltersDisabled}
          helperValue="name"
          placeholder="Enter name"
          tags={names}
          warningMessage="Name already exists!"
          onTagAdd={tag => updateNames(tag, 'add')}
          onTagRemove={tag => updateNames(tag, 'remove')}
        />
      </S.Field>

      <S.Field>
        <S.FieldLabel>Kind:</S.FieldLabel>
        <Select
          disabled={areFiltersDisabled}
          placeholder="Select one or multiple kinds"
          showArrow
          showSearch
          mode="multiple"
          style={{width: '100%'}}
          value={kinds || []}
          onChange={updateKinds}
        >
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
        <S.SelectStyled
          defaultValue={ROOT_OPTIONS}
          disabled={isInPreviewMode || areFiltersDisabled}
          showSearch
          value={fileOrFolderContainedIn || ROOT_OPTIONS}
          onChange={updateFileOrFolderContainedIn}
        >
          {fileOrFolderContainedInOptions}
        </S.SelectStyled>
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
