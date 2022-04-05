import {useMemo} from 'react';

import {Dropdown, Tag} from 'antd';

import {PREVIEW_PREFIX} from '@constants/constants';

import {ResourceRefType} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectK8sResource} from '@redux/reducers/main';
import {filteredResourceSelector, isInPreviewModeSelector} from '@redux/selectors';

import {Icon} from '@atoms';

import * as S from './WarningAndErrorsDisplay.styled';

type Warning = {
  id: string;
  type: string;
  name: string;
  count: number;
  namespace: string | undefined;
};

type RefDropdownMenuProps = {
  type: 'error' | 'warning';
  warnings: Warning[];
};

const sortWarnings = (warnings: Warning[]) =>
  warnings.sort((a, b) => {
    if (a.type && b.type && a.type !== b.type) {
      return a.type.localeCompare(b.type);
    }
    if (a.namespace && !b.namespace) {
      return -1;
    }
    if (!a.namespace && b.namespace) {
      return 1;
    }
    if (a.namespace && b.namespace && a.namespace !== b.namespace) {
      return a.namespace.localeCompare(b.namespace);
    }
    return a.name && b.name ? a.name.localeCompare(b.name) : 0;
  });

const RefDropdownMenu = (props: RefDropdownMenuProps) => {
  const {type, warnings} = props;

  const dispatch = useAppDispatch();

  return (
    <S.StyledMenu>
      {warnings.map(warning => (
        <S.StyledMenuItem key={warning.id} onClick={() => dispatch(selectK8sResource({resourceId: warning.id}))}>
          {warning.namespace && <Tag>{warning.namespace}</Tag>}
          <span>{warning.name}</span>
          <S.WarningCountContainer $type={type}>
            <S.Icon $type={type} name={type} /> {warning.count}
          </S.WarningCountContainer>
          <S.WarningKindLabel>{warning.type}</S.WarningKindLabel>
        </S.StyledMenuItem>
      ))}
    </S.StyledMenu>
  );
};

function WarningsAndErrorsDisplay() {
  const filteredResources = useAppSelector(filteredResourceSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);

  const resources = useMemo(() => {
    return filteredResources.filter(resource =>
      isInPreviewMode ? resource.filePath.startsWith(PREVIEW_PREFIX) : !resource.filePath.startsWith(PREVIEW_PREFIX)
    );
  }, [filteredResources, isInPreviewMode]);

  const warnings: any[] = useMemo(() => {
    const warningsCollection = resources
      .map(resource => {
        if (resource.refs) {
          const unsatisfiedRefs = resource.refs.filter(ref => ref.type === ResourceRefType.Unsatisfied);
          if (unsatisfiedRefs.length > 0) {
            return {
              id: resource.id,
              type: resource.kind,
              name: resource.name,
              count: unsatisfiedRefs.length,
              namespace: resource.namespace,
            };
          }
          return null;
        }
        return null;
      })
      .filter(warning => warning);
    return sortWarnings(warningsCollection as Warning[]);
  }, [resources]);

  const errors: any[] = useMemo(() => {
    const errorsCollection = resources
      .map(resource => {
        if (resource.validation && !resource.validation.isValid) {
          return {
            id: resource.id,
            type: resource.kind,
            name: resource.name,
            count: resource.validation.errors.length,
            namespace: resource.namespace,
          };
        }
        return null;
      })
      .filter(error => error);

    return sortWarnings(errorsCollection as Warning[]);
  }, [resources]);

  const warningsCount = useMemo(() => {
    return resources.reduce<number>((acc, resource) => {
      return acc + (resource.refs ? resource.refs.filter(ref => ref.type === ResourceRefType.Unsatisfied).length : 0);
    }, 0);
  }, [resources]);

  const errorsCount = useMemo(() => {
    return resources.reduce<number>((acc, resource) => {
      return acc + (resource.validation && !resource.validation.isValid ? resource.validation.errors.length : 0);
    }, 0);
  }, [resources]);

  return (
    <>
      {warningsCount > 0 && (
        <Dropdown
          overlay={<RefDropdownMenu type="warning" warnings={warnings} />}
          trigger={['click']}
          placement="bottomCenter"
        >
          <S.ErrorWarningContainer $type="warning">
            <Icon name="warning" />
            <S.Label>{warningsCount}</S.Label>
          </S.ErrorWarningContainer>
        </Dropdown>
      )}

      {errorsCount > 0 && (
        <Dropdown
          overlay={<RefDropdownMenu type="error" warnings={errors} />}
          trigger={['click']}
          placement="bottomCenter"
        >
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
