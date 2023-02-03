// import {useMemo} from 'react';
// import {Dropdown} from 'antd';
// import {PREVIEW_PREFIX} from '@constants/constants';
// import {useAppSelector} from '@redux/hooks';
// import {filteredResourceSelector} from '@redux/selectors';
// import {useRefDropdownMenuItems} from '@hooks/menuItemsHooks';
// import {countResourceErrors, countResourceWarnings} from '@utils/resources';
// import {Icon} from '@monokle/components';
// import {ResourceRefType} from '@shared/models/k8sResource';
// import {isDefined} from '@shared/utils/filter';
// import {isInPreviewModeSelector} from '@shared/utils/selectors';
// import * as S from './WarningAndErrorsDisplay.styled';

export type Warning = {
  id: string;
  type: string;
  name: string;
  count: number;
  namespace: string | undefined;
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

// TODO: reimplement this after @monokle/validation is integrated
function WarningsAndErrorsDisplay() {
  return <div />;
  // const filteredResources = useAppSelector(filteredResourceSelector);
  // const isInPreviewMode = useAppSelector(isInPreviewModeSelector);

  // const resources = useMemo(() => {
  //   return filteredResources.filter(resource =>
  //     isInPreviewMode ? resource.filePath.startsWith(PREVIEW_PREFIX) : !resource.filePath.startsWith(PREVIEW_PREFIX)
  //   );
  // }, [filteredResources, isInPreviewMode]);

  // const warnings = useMemo(() => {
  //   const warningsCollection = resources
  //     .map(resource => {
  //       if (resource.refs) {
  //         const unsatisfiedRefs = resource.refs.filter(ref => ref.type === ResourceRefType.Unsatisfied);
  //         if (unsatisfiedRefs.length > 0) {
  //           return {
  //             id: resource.id,
  //             type: resource.kind,
  //             name: resource.name,
  //             count: unsatisfiedRefs.length,
  //             namespace: resource.namespace,
  //           };
  //         }
  //         return null;
  //       }
  //       return null;
  //     })
  //     .filter(isDefined);

  //   return sortWarnings(warningsCollection);
  // }, [resources]);

  // const errors = useMemo(() => {
  //   const schemaWarnings: Warning[] = resources
  //     .map(resource => {
  //       if (resource.validation && !resource.validation.isValid) {
  //         return {
  //           id: resource.id,
  //           type: resource.kind,
  //           name: resource.name,
  //           count: resource.validation.errors.length,
  //           namespace: resource.namespace,
  //         };
  //       }
  //       return null;
  //     })
  //     .filter(isDefined);

  //   const policyWarnings: Warning[] = resources
  //     .map((resource): Warning | null => {
  //       return resource.issues && !resource.issues.isValid
  //         ? {
  //             id: resource.id,
  //             type: resource.kind,
  //             name: resource.name,
  //             count: resource.issues.errors.length,
  //             namespace: resource.namespace,
  //           }
  //         : null;
  //     })
  //     .filter(isDefined);

  //   return sortWarnings([...schemaWarnings, ...policyWarnings]);
  // }, [resources]);

  // const warningsRefDropdownMenuItems = useRefDropdownMenuItems('warning', warnings);
  // const errorsRefDropdownMenuItems = useRefDropdownMenuItems('error', errors);

  // const warningsCount = useMemo(() => countResourceWarnings(resources), [resources]);
  // const errorsCount = useMemo(() => countResourceErrors(resources), [resources]);

  // return (
  //   <>
  //     {warningsCount > 0 && (
  //       <Dropdown menu={{items: warningsRefDropdownMenuItems}} trigger={['click']} placement="bottom">
  //         <S.ErrorWarningContainer $type="warning">
  //           <Icon name="warning" />
  //           <S.Label>{warningsCount}</S.Label>
  //         </S.ErrorWarningContainer>
  //       </Dropdown>
  //     )}

  //     {errorsCount > 0 && (
  //       <Dropdown menu={{items: errorsRefDropdownMenuItems}} trigger={['click']} placement="bottom">
  //         <S.ErrorWarningContainer $type="error">
  //           <Icon name="error" style={{paddingTop: '2px'}} />
  //           <S.Label>{errorsCount}</S.Label>
  //         </S.ErrorWarningContainer>
  //       </Dropdown>
  //     )}
  //   </>
  // );
}

export default WarningsAndErrorsDisplay;
