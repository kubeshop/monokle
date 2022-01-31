import {useCallback, useEffect} from 'react';

import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {ResourceFilterType} from '@models/appstate';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {extendResourceFilter, setFiltersToBeChanged, uncheckMultipleResourceIds} from '@redux/reducers/main';

import {isResourcePassingFilter} from '@utils/resources';

const ChangeFiltersConfirmModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const checkedResourceIds = useAppSelector(state => state.main.checkedResourceIds);
  const filtersToBeChanged = useAppSelector(state => state.main.filtersToBeChanged);
  const resourceFilter = useAppSelector(state => state.main.resourceFilter);
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  const constructNewFilter = useCallback(() => {
    if (!filtersToBeChanged) {
      return;
    }

    let newFilter: ResourceFilterType = {
      namespace: filtersToBeChanged.namespace
        ? filtersToBeChanged.namespace === resourceFilter.namespace
          ? undefined
          : filtersToBeChanged.namespace
        : resourceFilter.namespace,
      kind: filtersToBeChanged.kind
        ? filtersToBeChanged.kind === resourceFilter.kind
          ? undefined
          : filtersToBeChanged.kind
        : resourceFilter.kind,
      fileOrFolderContainedIn: filtersToBeChanged.fileOrFolderContainedIn
        ? filtersToBeChanged.fileOrFolderContainedIn === resourceFilter.fileOrFolderContainedIn
          ? undefined
          : filtersToBeChanged.fileOrFolderContainedIn
        : resourceFilter.fileOrFolderContainedIn,
      name: resourceFilter.name,
      labels: resourceFilter.labels,
      annotations: resourceFilter.annotations,
    };

    Object.keys(filtersToBeChanged.labels).forEach(key => {
      if (newFilter.labels[key] === filtersToBeChanged.labels[key]) {
        delete newFilter.labels[key];
      } else {
        newFilter.labels[key] = filtersToBeChanged.labels[key];
      }
    });
    Object.keys(filtersToBeChanged.annotations).forEach(key => {
      if (newFilter.annotations[key] === filtersToBeChanged.annotations[key]) {
        delete newFilter.annotations[key];
      } else {
        newFilter.annotations[key] = filtersToBeChanged.annotations[key];
      }
    });

    return newFilter;
  }, [
    filtersToBeChanged,
    resourceFilter.annotations,
    resourceFilter.fileOrFolderContainedIn,
    resourceFilter.kind,
    resourceFilter.labels,
    resourceFilter.name,
    resourceFilter.namespace,
  ]);

  const uncheckHiddenResources = useCallback(() => {
    let uncheckingResourceIds: string[] = [];
    let newFilter = constructNewFilter();

    checkedResourceIds.forEach(id => {
      const resource = resourceMap[id];

      if (newFilter && !isResourcePassingFilter(resource, newFilter)) {
        uncheckingResourceIds.push(resource.id);
      }
    });

    dispatch(uncheckMultipleResourceIds(uncheckingResourceIds));
  }, [checkedResourceIds, constructNewFilter, dispatch, resourceMap]);

  useEffect(() => {
    if (!filtersToBeChanged) {
      return;
    }

    Modal.confirm({
      title: 'Changing the filter will uncheck all hidden resources',
      icon: <ExclamationCircleOutlined />,
      onOk() {
        return new Promise(resolve => {
          uncheckHiddenResources();
          dispatch(extendResourceFilter(filtersToBeChanged));
          resolve({});
        });
      },
      onCancel() {
        dispatch(setFiltersToBeChanged(undefined));
      },
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersToBeChanged]);

  return null;
};

export default ChangeFiltersConfirmModal;
