import {MonacoDiffEditor} from 'react-monaco-editor';
import {useSelector} from 'react-redux';

import {Col, Row} from 'antd';

import styled from 'styled-components';

import {selectDiffedComparison} from '@redux/reducers/compare';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import {PartialStore} from './CompareModal';
import {DiffComparisonList} from './ComparisonList';

export function CompareModalComparing() {
  const {diff} = useSelector((state: PartialStore) => state.compare.current);
  const diffComparison = useSelector((state: PartialStore) => selectDiffedComparison(state.compare));

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
      <ListRow style={{height: 'calc(100% - 100px)'}}>
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
      </ListRow>
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

const ListRow = styled(Row)`
  overflow: auto;
`;
