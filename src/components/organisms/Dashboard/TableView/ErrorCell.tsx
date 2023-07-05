import {useCallback} from 'react';

import {isEmpty} from 'lodash';

import {setActiveTab, setDashboardSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch} from '@redux/hooks';
import {setMonacoEditor} from '@redux/reducers/ui';

import {useValidationLevel} from '@hooks/useValidationLevel';

import {ProblemIcon, ValidationPopover} from '@monokle/components';
import {ValidationResult, getResourceLocation} from '@monokle/validation';
import {MonacoRange} from '@shared/models/ui';

import * as S from './ErrorCell.styled';

type IProps = {
  resourceId: string;
  resourceKind: string;
};

const ErrorCell: React.FC<IProps> = props => {
  const {resourceId, resourceKind} = props;

  const {level, errors, warnings} = useValidationLevel(resourceId);
  const dispatch = useAppDispatch();

  const onMessageClickHandler = useCallback(
    (result: ValidationResult) => {
      dispatch(setDashboardSelectedResourceId(resourceId));
      dispatch(setActiveTab({tab: 'Manifest', kind: resourceKind}));

      const location = getResourceLocation(result);
      const region = location.physicalLocation?.region;

      if (!region) return;

      const targetOutgoingRefRange: MonacoRange = {
        endColumn: region.endColumn,
        endLineNumber: region.endLine,
        startColumn: region.startColumn,
        startLineNumber: region.startLine,
      };

      setImmediate(() => {
        dispatch(setMonacoEditor({selection: {type: 'resource', resourceId, range: targetOutgoingRefRange}}));
      });
    },
    [dispatch, resourceId, resourceKind]
  );

  if (isEmpty(errors) && isEmpty(warnings)) {
    return <span style={{padding: '2px 4px'}}>-</span>;
  }

  return (
    <S.Container
      onClick={e => {
        e.stopPropagation();
      }}
    >
      <ValidationPopover
        level={level}
        results={[...errors, ...warnings]}
        onMessageClickHandler={onMessageClickHandler}
        popoverRenderItem={
          <S.RenderContainer>
            <ProblemIcon level={level} />
            <S.ErrorContainer>
              {errors.length > 0 && <S.ErrorText $type="error">{errors.length} errors</S.ErrorText>}
              {warnings.length > 0 && <S.ErrorText $type="warning">{warnings.length} warnings</S.ErrorText>}
            </S.ErrorContainer>
          </S.RenderContainer>
        }
      />
    </S.Container>
  );
};

export default ErrorCell;
