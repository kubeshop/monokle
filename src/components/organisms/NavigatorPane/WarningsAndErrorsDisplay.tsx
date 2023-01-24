import {useMemo} from 'react';

import {Dropdown, Tag} from 'antd';

import {PREVIEW_PREFIX} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectK8sResource} from '@redux/reducers/main';
import {filteredResourceSelector} from '@redux/selectors';

import {countResourceErrors, countResourceWarnings} from '@utils/resources';

import {Icon} from '@monokle/components';
import {ResourceRefType} from '@shared/models/k8sResource';
import {isDefined} from '@shared/utils/filter';
import {isInPreviewModeSelectorNew} from '@shared/utils/selectors';

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

  const menuItems = useMemo(
    () =>
      warnings.map(warning => ({
        key: warning.id,
        label: (
          <S.StyledMenuItem key={warning.id} onClick={() => dispatch(selectK8sResource({resourceId: warning.id}))}>
            {warning.namespace && <Tag>{warning.namespace}</Tag>}
            <span>{warning.name}</span>
            <S.WarningCountContainer $type={type}>
              <S.Icon $type={type} name={type} /> {warning.count}
            </S.WarningCountContainer>
            <S.WarningKindLabel>{warning.type}</S.WarningKindLabel>
          </S.StyledMenuItem>
        ),
      })),
    [dispatch, type, warnings]
  );

  return <S.StyledMenu items={menuItems} />;
};

function WarningsAndErrorsDisplay() {
  const filteredResources = useAppSelector(filteredResourceSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);

  const resources = useMemo(() => {
    return filteredResources.filter(resource =>
      isInPreviewMode ? resource.filePath.startsWith(PREVIEW_PREFIX) : !resource.filePath.startsWith(PREVIEW_PREFIX)
    );
  }, [filteredResources, isInPreviewMode]);

  const warnings = useMemo(() => {
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
      .filter(isDefined);

    return sortWarnings(warningsCollection);
  }, [resources]);

  const errors = useMemo(() => {
    const schemaWarnings: Warning[] = resources
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
      .filter(isDefined);

    const policyWarnings: Warning[] = resources
      .map((resource): Warning | null => {
        return resource.issues && !resource.issues.isValid
          ? {
              id: resource.id,
              type: resource.kind,
              name: resource.name,
              count: resource.issues.errors.length,
              namespace: resource.namespace,
            }
          : null;
      })
      .filter(isDefined);

    return sortWarnings([...schemaWarnings, ...policyWarnings]);
  }, [resources]);

  const warningsCount = useMemo(() => countResourceWarnings(resources), [resources]);
  const errorsCount = useMemo(() => countResourceErrors(resources), [resources]);

  return (
    <>
      {warningsCount > 0 && (
        <Dropdown
          overlay={<RefDropdownMenu type="warning" warnings={warnings} />}
          trigger={['click']}
          placement="bottom"
        >
          <S.ErrorWarningContainer $type="warning">
            <Icon name="warning" />
            <S.Label>{warningsCount}</S.Label>
          </S.ErrorWarningContainer>
        </Dropdown>
      )}

      {errorsCount > 0 && (
        <Dropdown overlay={<RefDropdownMenu type="error" warnings={errors} />} trigger={['click']} placement="bottom">
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
