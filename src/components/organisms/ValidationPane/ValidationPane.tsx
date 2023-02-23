import {useCallback} from 'react';
import {useMeasure} from 'react-use';

import {Image, Skeleton} from 'antd';
import Link from 'antd/lib/typography/Link';

import {useAppDispatch} from '@redux/hooks';
import {selectFile, selectResource} from '@redux/reducers/main';
import {setLeftMenuSelection, setMonacoEditor} from '@redux/reducers/ui';
import {activeResourceStorageSelector, useActiveResourceMetaMapRef} from '@redux/selectors/resourceMapSelectors';
import {useSelectedResourceRef} from '@redux/selectors/resourceSelectors';
import {useValidationSelector} from '@redux/validation/validation.selectors';
import {setSelectedProblem} from '@redux/validation/validation.slice';

import {useMainPaneDimensions, useRefSelector} from '@utils/hooks';

import ValidationFigure from '@assets/NewValidationFigure.svg';

import {TitleBar, ValidationOverview} from '@monokle/components';
import {getFileLocation, getResourceId, getResourceLocation} from '@monokle/validation';
import {MonacoRange} from '@shared/models/ui';
import {SelectedProblem} from '@shared/models/validation';

import * as S from './ValidationPane.styled';

const ValidationPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeResourceMetaMapRef = useActiveResourceMetaMapRef();
  const activeResourceStorageRef = useRefSelector(activeResourceStorageSelector);
  const fileMapRef = useRefSelector(state => state.main.fileMap);
  const lastResponse = useValidationSelector(state => state.lastResponse);
  const newProblemsIntroducedType = useValidationSelector(state => state.validationOverview.newProblemsIntroducedType);
  const selectedProblem = useValidationSelector(state => state.validationOverview.selectedProblem?.problem);
  const selectedResourceRef = useSelectedResourceRef();
  const status = useValidationSelector(state => state.status);

  const [titleBarRef, {height: titleBarHeight}] = useMeasure<HTMLDivElement>();

  const {height} = useMainPaneDimensions();

  const onProblemSelect = useCallback(
    (problem: SelectedProblem) => {
      dispatch(setSelectedProblem(problem));

      if (problem.selectedFrom === 'file') {
        const location = getFileLocation(problem.problem);
        const problemFilePath = location.physicalLocation?.artifactLocation?.uri;
        const region = location.physicalLocation?.region;

        if (!problemFilePath) {
          return;
        }

        if (fileMapRef.current[problemFilePath]) {
          dispatch(selectFile({filePath: problemFilePath}));
        }

        if (!region) {
          return;
        }

        const targetOutgoingRefRange: MonacoRange = {
          endColumn: region.endColumn,
          endLineNumber: region.endLine,
          startColumn: region.startColumn,
          startLineNumber: region.startLine,
        };

        setImmediate(() => {
          dispatch(
            setMonacoEditor({selection: {type: 'file', filePath: problemFilePath, range: targetOutgoingRefRange}})
          );
        });
      }

      if (problem.selectedFrom === 'resource') {
        const resourceId = getResourceId(problem.problem) ?? '';
        const location = getResourceLocation(problem.problem);
        const region = location.physicalLocation?.region;

        if (selectedResourceRef.current?.id !== resourceId) {
          if (activeResourceMetaMapRef.current[resourceId]) {
            dispatch(selectResource({resourceIdentifier: {id: resourceId, storage: activeResourceStorageRef.current}}));
          }
        }

        if (!region) return;

        const targetOutgoingRefRange: MonacoRange = {
          endColumn: region.endColumn,
          endLineNumber: region.endLine,
          startColumn: region.startColumn,
          startLineNumber: region.startLine,
        };

        dispatch(setMonacoEditor({selection: {type: 'resource', resourceId, range: targetOutgoingRefRange}}));
      }
    },
    [activeResourceMetaMapRef, activeResourceStorageRef, dispatch, fileMapRef, selectedResourceRef]
  );

  if (!lastResponse) {
    return null;
  }

  return (
    <S.ValidationPaneContainer>
      <div ref={titleBarRef}>
        <TitleBar
          title="Validation Overview"
          description={
            <S.DescriptionContainer>
              <Image src={ValidationFigure} width={95} />
              <div>
                Fix your resources according to your validation setup. Manage your validation policy, turn rules on or
                off, and more in the <Link onClick={() => dispatch(setLeftMenuSelection('settings'))}>settings</Link>{' '}
                section, located in the left menu.
              </div>
            </S.DescriptionContainer>
          }
        />
      </div>

      {status === 'loading' ? (
        <Skeleton active style={{marginTop: '15px'}} />
      ) : (
        <ValidationOverview
          containerStyle={{marginTop: '20px'}}
          height={height - titleBarHeight - 40}
          newProblemsIntroducedType={newProblemsIntroducedType}
          selectedProblem={selectedProblem}
          validationResponse={lastResponse}
          onProblemSelect={onProblemSelect}
        />
      )}
    </S.ValidationPaneContainer>
  );
};

export default ValidationPane;
