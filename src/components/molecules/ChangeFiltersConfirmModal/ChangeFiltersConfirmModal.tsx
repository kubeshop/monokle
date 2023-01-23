import {useCallback, useEffect} from 'react';

import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {isEqual} from 'lodash';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {extendResourceFilter, setFiltersToBeChanged, uncheckMultipleResourceIds} from '@redux/reducers/main';

import {isResourcePassingFilter} from '@utils/resources';

import {ResourceFilterType} from '@shared/models/appState';
import {ResourceIdentifier} from '@shared/models/k8sResource';
import {findResourceMetaInStorage} from '@shared/utils/resource';

const ChangeFiltersConfirmModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const checkedResourceIdentifiers = useAppSelector(state => state.main.checkedResourceIdentifiers);
  const filtersToBeChanged = useAppSelector(state => state.main.filtersToBeChanged);
  const resourceFilter = useAppSelector(state => state.main.resourceFilter);
  const resourceMetaStorage = useAppSelector(state => state.main.resourceMetaStorage);

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
      kinds: filtersToBeChanged.kinds
        ? isEqual(filtersToBeChanged.kinds, resourceFilter.kinds)
          ? undefined
          : filtersToBeChanged.kinds
        : resourceFilter.kinds,
      fileOrFolderContainedIn: filtersToBeChanged.fileOrFolderContainedIn
        ? filtersToBeChanged.fileOrFolderContainedIn === resourceFilter.fileOrFolderContainedIn
          ? undefined
          : filtersToBeChanged.fileOrFolderContainedIn
        : resourceFilter.fileOrFolderContainedIn,
      names: filtersToBeChanged.names
        ? isEqual(filtersToBeChanged.names, resourceFilter.names)
          ? undefined
          : filtersToBeChanged.names
        : resourceFilter.names,
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
    resourceFilter.kinds,
    resourceFilter.labels,
    resourceFilter.names,
    resourceFilter.namespace,
  ]);

  const uncheckHiddenResources = useCallback(() => {
    let uncheckingResourceIdentifiers: ResourceIdentifier[] = [];
    let newFilter = constructNewFilter();

    checkedResourceIdentifiers.forEach(identifier => {
      const resourceMeta = findResourceMetaInStorage(identifier, resourceMetaStorage);

      if (newFilter && resourceMeta && !isResourcePassingFilter(resourceMeta, newFilter)) {
        uncheckingResourceIdentifiers.push(identifier);
      }
    });

    dispatch(uncheckMultipleResourceIds(uncheckingResourceIdentifiers));
  }, [checkedResourceIdentifiers, constructNewFilter, dispatch, resourceMetaStorage]);

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
