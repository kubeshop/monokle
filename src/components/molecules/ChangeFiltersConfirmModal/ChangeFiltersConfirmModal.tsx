import {useCallback, useEffect} from 'react';

import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {isEqual} from 'lodash';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {extendResourceFilter, setFiltersToBeChanged, uncheckMultipleResourceIds} from '@redux/reducers/main';

import {useSelectorWithRef} from '@utils/hooks';
import {isResourcePassingFilter} from '@utils/resources';

import {ResourceFilterType} from '@shared/models/appState';
import {ResourceIdentifier} from '@shared/models/k8sResource';

const ChangeFiltersConfirmModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const checkedResourceIdentifiers = useAppSelector(state => state.main.checkedResourceIdentifiers);
  const filtersToBeChanged = useAppSelector(state => state.main.filtersToBeChanged);
  const [, resourceFilterRef] = useSelectorWithRef(state => state.main.resourceFilter);
  const [, resourceMetaMapByStorageRef] = useSelectorWithRef(state => state.main.resourceMetaMapByStorage);

  const constructNewFilter = useCallback(() => {
    if (!filtersToBeChanged) {
      return;
    }

    let newFilter: ResourceFilterType = {
      namespace: filtersToBeChanged.namespace
        ? filtersToBeChanged.namespace === resourceFilterRef.current.namespace
          ? undefined
          : filtersToBeChanged.namespace
        : resourceFilterRef.current.namespace,
      kinds: filtersToBeChanged.kinds
        ? isEqual(filtersToBeChanged.kinds, resourceFilterRef.current.kinds)
          ? undefined
          : filtersToBeChanged.kinds
        : resourceFilterRef.current.kinds,
      fileOrFolderContainedIn: filtersToBeChanged.fileOrFolderContainedIn
        ? filtersToBeChanged.fileOrFolderContainedIn === resourceFilterRef.current.fileOrFolderContainedIn
          ? undefined
          : filtersToBeChanged.fileOrFolderContainedIn
        : resourceFilterRef.current.fileOrFolderContainedIn,
      names: filtersToBeChanged.names
        ? isEqual(filtersToBeChanged.names, resourceFilterRef.current.names)
          ? undefined
          : filtersToBeChanged.names
        : resourceFilterRef.current.names,
      labels: resourceFilterRef.current.labels,
      annotations: resourceFilterRef.current.annotations,
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
  }, [filtersToBeChanged, resourceFilterRef]);

  const uncheckHiddenResources = useCallback(() => {
    let uncheckingResourceIdentifiers: ResourceIdentifier[] = [];
    let newFilter = constructNewFilter();

    checkedResourceIdentifiers.forEach(identifier => {
      const resourceMeta = resourceMetaMapByStorageRef.current[identifier.storage][identifier.id];

      if (newFilter && resourceMeta && !isResourcePassingFilter(resourceMeta, newFilter)) {
        uncheckingResourceIdentifiers.push(identifier);
      }
    });

    dispatch(uncheckMultipleResourceIds(uncheckingResourceIdentifiers));
  }, [checkedResourceIdentifiers, constructNewFilter, dispatch, resourceMetaMapByStorageRef]);

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
