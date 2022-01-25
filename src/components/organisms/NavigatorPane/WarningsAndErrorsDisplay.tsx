import {useMemo} from 'react';

import {Dropdown} from 'antd';

import {sortBy} from 'lodash';

import {PREVIEW_PREFIX} from '@constants/constants';

import {ResourceRefType} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectK8sResource} from '@redux/reducers/main';
import {isInPreviewModeSelector} from '@redux/selectors';

import {Icon} from '@atoms';

import * as S from './WarningAndErrorsDisplay.styled';

type Warning = {
  id: string;
  type: string;
  name: string;
  count: number;
};

type RefDropdownMenuProps = {
  warnings: Warning[];
};

const RefDropdownMenu = (props: RefDropdownMenuProps) => {
  const {warnings} = props;

  const dispatch = useAppDispatch();

  return (
    <S.StyledMenu>
      {warnings.map(warning => (
        <S.StyledMenuItem key={warning.id} onClick={() => dispatch(selectK8sResource({resourceId: warning.id}))}>
          <S.Label>{warning.type}:</S.Label>
          <S.Label>&nbsp;{warning.name}</S.Label>
          <S.Label>&nbsp;({warning.count})</S.Label>
        </S.StyledMenuItem>
      ))}
    </S.StyledMenu>
  );
};

function WarningsAndErrorsDisplay() {
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);

  const warnings: any[] = useMemo(() => {
    const warningsCollection = Object.values(resourceMap)
      .filter(resource =>
        isInPreviewMode ? resource.filePath.startsWith(PREVIEW_PREFIX) : !resource.filePath.startsWith(PREVIEW_PREFIX)
      )
      .map(resource => {
        if (resource.refs) {
          const unsatisfiedRefs = resource.refs.filter(ref => ref.type === ResourceRefType.Unsatisfied);
          if (unsatisfiedRefs.length > 0) {
            return {
              id: resource.id,
              type: resource.kind,
              name: resource.name,
              count: unsatisfiedRefs.length,
            };
          }
          return null;
        }
        return null;
      })
      .filter(warning => warning);
    return sortBy(warningsCollection, ['type', 'name']);
  }, [resourceMap, isInPreviewMode]);

  const errors: any[] = useMemo(() => {
    return Object.values(resourceMap)
      .filter(resource =>
        isInPreviewMode ? resource.filePath.startsWith(PREVIEW_PREFIX) : !resource.filePath.startsWith(PREVIEW_PREFIX)
      )
      .map(resource => {
        if (resource.validation && !resource.validation.isValid) {
          return {
            id: resource.id,
            type: resource.kind,
            name: resource.name,
            count: resource.validation.errors.length,
          };
        }
        return null;
      })
      .filter(error => error);
  }, [resourceMap, isInPreviewMode]);

  const warningsCount = useMemo(() => {
    return Object.values(resourceMap)
      .filter(resource =>
        isInPreviewMode ? resource.filePath.startsWith(PREVIEW_PREFIX) : !resource.filePath.startsWith(PREVIEW_PREFIX)
      )
      .reduce<number>((acc, resource) => {
        return acc + (resource.refs ? resource.refs.filter(ref => ref.type === ResourceRefType.Unsatisfied).length : 0);
      }, 0);
  }, [resourceMap, isInPreviewMode]);

  const errorsCount = useMemo(() => {
    return Object.values(resourceMap)
      .filter(resource =>
        isInPreviewMode ? resource.filePath.startsWith(PREVIEW_PREFIX) : !resource.filePath.startsWith(PREVIEW_PREFIX)
      )
      .reduce<number>((acc, resource) => {
        return acc + (resource.validation && !resource.validation.isValid ? resource.validation.errors.length : 0);
      }, 0);
  }, [resourceMap, isInPreviewMode]);

  return (
    <>
      {warningsCount > 0 && (
        <Dropdown overlay={<RefDropdownMenu warnings={warnings} />} trigger={['click']} placement="bottomCenter">
          <S.ErrorWarningContainer $type="warning">
            <Icon name="warning" />
            <S.Label>{warningsCount}</S.Label>
          </S.ErrorWarningContainer>
        </Dropdown>
      )}

      {errorsCount > 0 && (
        <Dropdown overlay={<RefDropdownMenu warnings={errors} />} trigger={['click']} placement="bottomCenter">
          <S.ErrorWarningContainer $type="error">
            <Icon name="error" style={{paddingTop: '2px'}} />
            <S.Label>{errorsCount}</S.Label>
          </S.ErrorWarningContainer>
        </Dropdown>
      )}
    </>
  );
}

export default WarningsAndErrorsDisplay;
