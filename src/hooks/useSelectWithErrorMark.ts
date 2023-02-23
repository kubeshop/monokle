import {useCallback} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile, selectResource} from '@redux/reducers/main';
import {setMonacoEditor} from '@redux/reducers/ui';
import {selectedFilePathSelector} from '@redux/selectors';
import {activeResourceStorageSelector, useActiveResourceMetaMapRef} from '@redux/selectors/resourceMapSelectors';
import {useSelectedResourceRef} from '@redux/selectors/resourceSelectors';

import {useRefSelector} from '@utils/hooks';

import {getFileLocation, getResourceId, getResourceLocation} from '@monokle/validation';
import {MonacoRange} from '@shared/models/ui';
import {SelectedProblem} from '@shared/models/validation';

export function useSelectWithErrorMark(problem?: SelectedProblem) {
  const dispatch = useAppDispatch();
  const activeResourceMetaMapRef = useActiveResourceMetaMapRef();
  const activeResourceStorageRef = useRefSelector(activeResourceStorageSelector);
  const fileMapRef = useRefSelector(state => state.main.fileMap);
  const selectedFilePath = useAppSelector(selectedFilePathSelector);
  const selectedResourceRef = useSelectedResourceRef();

  const selectFileWithErrorMark = useCallback(() => {
    if (!problem) return;
    if (problem.selectedFrom === 'resource') return;

    if (problem.selectedFrom === 'file') {
      const location = getFileLocation(problem.problem);
      const problemFilePath = location.physicalLocation?.artifactLocation?.uri;
      const region = location.physicalLocation?.region;

      if (!problemFilePath) {
        return;
      }

      if (fileMapRef.current[problemFilePath] && problemFilePath !== selectedFilePath) {
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

      // used setTimeout as it takes a little bit for the monaco editor to mount
      setTimeout(() => {
        dispatch(
          setMonacoEditor({selection: {type: 'file', filePath: problemFilePath, range: targetOutgoingRefRange}})
        );
      }, 50);
    }
  }, [dispatch, fileMapRef, problem, selectedFilePath]);

  const selectResourceWithErrorMark = useCallback(() => {
    if (!problem) return;
    if (problem.selectedFrom === 'file') return;

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

    setTimeout(() => {
      dispatch(setMonacoEditor({selection: {type: 'resource', resourceId, range: targetOutgoingRefRange}}));
    }, 50);
  }, [activeResourceMetaMapRef, activeResourceStorageRef, dispatch, problem, selectedResourceRef]);

  return {selectFileWithErrorMark, selectResourceWithErrorMark};
}
