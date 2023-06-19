import {useMemo} from 'react';
import {useMeasure} from 'react-use';

import {DEFAULT_PANE_TITLE_HEIGHT} from '@constants/constants';

import {useAppSelector} from '@redux/hooks';

import {SelectItemImage} from '@atoms';

import {useProblemPaneMenuItems} from '@hooks/menuItemsHooks';
import {usePaneHeight} from '@hooks/usePaneHeight';

import {ProblemInfo, TitleBar} from '@monokle/components';
import {getRuleForResultV2} from '@monokle/validation';
import {openUrlInExternalBrowser} from '@shared/utils';

import * as S from './ProblemPane.styled';

const ProblemPane: React.FC = () => {
  const lastResponse = useAppSelector(state => state.validation.lastResponse);
  const selectedProblem = useAppSelector(state => state.validation.validationOverview.selectedProblem?.problem ?? null);

  const [containerRef, {width: containerWidth}] = useMeasure<HTMLDivElement>();
  const [problemInfoRef, {height: problemInfoHeight}] = useMeasure<HTMLDivElement>();

  const height = usePaneHeight();

  const tabsItems = useProblemPaneMenuItems(
    containerWidth,
    height - DEFAULT_PANE_TITLE_HEIGHT - problemInfoHeight - 70
  );

  const rule = useMemo(() => {
    if (!lastResponse || !selectedProblem) {
      return null;
    }

    return getRuleForResultV2(lastResponse.runs[0], selectedProblem);
  }, [lastResponse, selectedProblem]);

  const sarifValue = useMemo(() => {
    return JSON.stringify({...selectedProblem, rule: {...rule}}, null, 2);
  }, [rule, selectedProblem]);

  if (!rule || !selectedProblem) {
    return (
      <SelectItemImage text="Select an error from the left to examine it, and receive hints and additional information on fixing it" />
    );
  }

  return (
    <S.ProblemPaneContainer ref={containerRef} key={sarifValue}>
      <TitleBar title="Editor" type="secondary" />

      <S.Tabs defaultActiveKey="editor" items={tabsItems} />

      {selectedProblem && (
        <div ref={problemInfoRef}>
          <ProblemInfo problem={selectedProblem} rule={rule} onHelpURLClick={url => openUrlInExternalBrowser(url)} />
        </div>
      )}
    </S.ProblemPaneContainer>
  );
};

export default ProblemPane;
