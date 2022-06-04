import {Col, Row} from 'antd';

import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';

import {ComparisonInspection} from './ComparisonInspection';
import {ComparisonList} from './ComparisonList';

export const CompareModalComparing: React.FC = () => {
  const isComparing = useAppSelector(
    state =>
      !state.compare.current.comparison ||
      state.compare.current.comparison?.loading ||
      state.compare.current.filtering?.pending
  );
  const inspecting = useAppSelector(state => state.compare.current.inspect);

  if (isComparing) {
    return (
      <Row>
        <Col span={24}>
          <p>comparing..</p>
        </Col>
      </Row>
    );
  }

  if (inspecting) {
    return (
      <DiffRow>
        <Col span={24}>
          <ComparisonInspection />
        </Col>
      </DiffRow>
    );
  }

  return (
    <Row>
      <Col span={24}>
        <ComparisonList />
      </Col>
    </Row>
  );
};

const DiffRow = styled(Row)`
  height: calc(100% - 100px);
  overflow: auto;
`;
