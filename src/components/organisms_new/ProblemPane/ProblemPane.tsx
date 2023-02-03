import {useMemo} from 'react';
import MonacoEditor, {monaco} from 'react-monaco-editor';
import {useMeasure} from 'react-use';

import {useAppSelector} from '@redux/hooks';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import {ProblemInfo, TitleBar} from '@monokle/components';
import {getRuleForResult} from '@monokle/validation';
import {openUrlInExternalBrowser} from '@shared/utils';

import * as S from './ProblemPane.styled';

const monacoOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  readOnly: true,
  minimap: {
    enabled: false,
  },
  lineNumbers: 'off',
};

const ProblemPane: React.FC = () => {
  const lastResponse = useAppSelector(state => state.validation.lastResponse);
  const selectedProblem = useAppSelector(state => state.validation.validationOverview.selectedProblem?.problem ?? null);

  const [containerRef, {width: containerWidth}] = useMeasure<HTMLDivElement>();

  const rule = useMemo(() => {
    if (!lastResponse || !selectedProblem) {
      return null;
    }

    return getRuleForResult(lastResponse, selectedProblem);
  }, [lastResponse, selectedProblem]);

  const sarifValue = useMemo(() => {
    return JSON.stringify({...selectedProblem, rule: {...rule}}, null, 2);
  }, [rule, selectedProblem]);

  if (!rule || !selectedProblem) {
    return null;
  }

  return (
    <S.ProblemPaneContainer ref={containerRef}>
      <TitleBar title="Editor" type="secondary" />

      <MonacoEditor
        width={containerWidth}
        theme={KUBESHOP_MONACO_THEME}
        options={monacoOptions}
        language="json"
        value={sarifValue}
      />

      {selectedProblem && (
        <ProblemInfo problem={selectedProblem} rule={rule} onHelpURLClick={url => openUrlInExternalBrowser(url)} />
      )}
    </S.ProblemPaneContainer>
  );
};

export default ProblemPane;
