import {useEffect, useMemo, useState} from 'react';
import {useDebounce} from 'react-use';

import {Button, Select, Tooltip} from 'antd';

import {ClearOutlined} from '@ant-design/icons';

import {isEmpty, isEqual, mapValues} from 'lodash';

import {DEFAULT_EDITOR_DEBOUNCE, PANE_CONSTRAINT_VALUES} from '@constants/constants';
import {ResetFiltersTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResourceFilter} from '@redux/reducers/main';
import {openFiltersPresetModal, toggleResourceFilters} from '@redux/reducers/ui';
import {
  allResourceAnnotationsSelector,
  allResourceKindsSelector,
  allResourceLabelsSelector,
  isInClusterModeSelector,
  isInPreviewModeSelectorNew,
} from '@redux/selectors';
import {startClusterConnection} from '@redux/thunks/cluster';

import {InputTags, KeyValueInput} from '@atoms';

import {useNamespaces} from '@hooks/useNamespaces';

import {useWindowSize} from '@utils/hooks';

import {kubeConfigContextSelector} from '@shared/utils/selectors';

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

  const areFiltersDisabled = useAppSelector(state => Boolean(state.main.checkedResourceIdentifiers.length));
  const fileMap = useAppSelector(state => state.main.fileMap);
  const filtersMap = useAppSelector(state => state.main.resourceFilter);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isPaneWideEnough = useAppSelector(
    state => windowWidth * state.ui.paneConfiguration.navPane > PANE_CONSTRAINT_VALUES.navPane
  );
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const resourceFilterKinds = useAppSelector(state => state.main.resourceFilter.kinds ?? []);

  const allResourceKinds = useAppSelector(allResourceKindsSelector);
  const allResourceLabels = useAppSelector(allResourceLabelsSelector);
  const allResourceAnnotations = useAppSelector(allResourceAnnotationsSelector);

  const allLabelsSchema = useMemo(() => mapValues(allResourceLabels, () => 'string'), [allResourceLabels]);
  const allAnnotationsSchema = useMemo(
    () => mapValues(allResourceAnnotations, () => 'string'),
    [allResourceAnnotations]
  );

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

      if (isInClusterMode && !isEqual(resourceFilterKinds, updatedFilter.kinds)) {
        dispatch(startClusterConnection({context: kubeConfigContext, isRestart: true}));
      }
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
          availableValuesByKey={allResourceLabels}
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
          availableValuesByKey={allResourceAnnotations}
          value={annotations}
          onChange={updateAnnotations}
        />
      </S.Field>

      <S.Field>
        <S.FieldLabel>Contained in file/folder:</S.FieldLabel>
        <S.SelectStyled
          defaultValue={ROOT_OPTIONS}
          disabled={isInPreviewMode || isInClusterMode || areFiltersDisabled}
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

export default ResourceFilter;
