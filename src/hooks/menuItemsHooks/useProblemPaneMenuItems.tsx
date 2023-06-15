import {useMemo} from 'react';
import MonacoEditor, {monaco} from 'react-monaco-editor';

import {TabsProps} from 'antd';

import {sep} from 'path';

import {useAppSelector} from '@redux/hooks';
import {
  problemFilePathAndRangeSelector,
  problemResourceAndRangeSelector,
  useValidationSelector,
} from '@redux/validation/validation.selectors';

import {Monaco} from '@components/molecules';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import {getRuleForResultV2} from '@monokle/validation';
import {ResourceStorage} from '@shared/models/k8sResource';
import {ResourceSelection} from '@shared/models/selection';
import {isEqual} from '@shared/utils/isEqual';

const monacoOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  readOnly: true,
  minimap: {
    enabled: false,
  },
  lineNumbers: 'off',
};

export function useProblemPaneMenuItems(width: number, height: number) {
  const lastResponse = useValidationSelector(state => state.lastResponse);
  const selectedProblem = useValidationSelector(state => state.validationOverview.selectedProblem?.problem ?? null);
  const selectedProblemMonacoData = useAppSelector(state => {
    const selectedFrom = state.validation.validationOverview.selectedProblem?.selectedFrom ?? '';
    if (!selectedFrom) return undefined;
    const monacoData: {filePath: ''; range: {}; resourceId: ''; storage: ResourceStorage} = {
      filePath: '',
      range: {},
      resourceId: '',
      storage: 'local',
    };

    if (selectedFrom === 'file') {
      return {...monacoData, ...problemFilePathAndRangeSelector(state.validation)};
    }

    if (selectedFrom === 'resource') {
      return {...monacoData, ...problemResourceAndRangeSelector(state)};
    }
  }, isEqual);

  const resourceSelection: ResourceSelection | undefined = useMemo(() => {
    if (!selectedProblemMonacoData?.resourceId) return undefined;

    return {
      type: 'resource',
      resourceIdentifier: {id: selectedProblemMonacoData.resourceId, storage: selectedProblemMonacoData.storage},
    };
  }, [selectedProblemMonacoData]);

  const rule = useMemo(() => {
    if (!lastResponse || !selectedProblem) {
      return null;
    }

    return getRuleForResultV2(lastResponse.runs[0], selectedProblem);
  }, [lastResponse, selectedProblem]);

  const sarifValue = useMemo(() => {
    return JSON.stringify({...selectedProblem, rule: {...rule}}, null, 2);
  }, [rule, selectedProblem]);

  const providedFilePath = useMemo(() => {
    if (!selectedProblemMonacoData) return undefined;

    const filePath = selectedProblemMonacoData.filePath;

    return filePath.startsWith(sep) ? filePath : sep + filePath;
  }, [selectedProblemMonacoData]);

  const items: TabsProps['items'] = useMemo(
    () => [
      {
        key: 'editor',
        label: 'Editor',
        children: (
          <Monaco
            height={height}
            applySelection={() => {}}
            diffSelectedResource={() => {}}
            providedResourceSelection={resourceSelection}
            providedFilePath={providedFilePath}
            providedRange={selectedProblemMonacoData?.range}
          />
        ),
      },
      {
        key: 'sarif',
        label: 'SARIF',
        children: (
          <MonacoEditor
            width={width}
            height={height}
            theme={KUBESHOP_MONACO_THEME}
            options={monacoOptions}
            language="json"
            value={sarifValue}
          />
        ),
      },
    ],
    [height, providedFilePath, resourceSelection, sarifValue, selectedProblemMonacoData?.range, width]
  );

  return items;
}
