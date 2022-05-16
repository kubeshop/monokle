import {MonacoDiffEditor} from 'react-monaco-editor';

import {Col, Row} from 'antd';

import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';
import {selectDiffedComparison} from '@redux/reducers/compare';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import {DiffComparisonList} from './ComparisonList';

export function CompareModalComparing() {
  const {diff} = useAppSelector(state => state.compare.current);
  const diffComparison = useAppSelector(state => selectDiffedComparison(state.compare));

  if (!diff || diff.loading) {
    return (
      <Row>
        <Col span={24}>
          <p>comparing..</p>
        </Col>
      </Row>
    );
  }

  if (diffComparison) {
    return (
      <DiffRow>
        <Col span={24}>
          <MonacoDiffEditor
            language="yaml"
            original={diffComparison.left.text}
            value={diffComparison.right.text}
            theme={KUBESHOP_MONACO_THEME}
            options={{
              renderIndicators: false,
              renderOverviewRuler: false,
              renderSideBySide: true,
              automaticLayout: true,
              minimap: {
                enabled: false,
              },
              readOnly: true,
              scrollbar: {
                vertical: 'hidden',
              },
            }}
          />
        </Col>
      </DiffRow>
    );
  }

  return (
    <Row>
      <Col span={24}>
        <DiffComparisonList data={diff} />
      </Col>
    </Row>
  );
}

const DiffRow = styled(Row)`
  height: calc(100% - 100px);
  overflow: auto;
`;
