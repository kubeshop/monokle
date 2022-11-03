import {useMeasure} from 'react-use';

import {Col, Row} from 'antd';

import {selectCompareStatus} from '@redux/compare';
import {useAppSelector} from '@redux/hooks';

import {TitleBar} from '@monokle/components';

import {ResourceSetSelector} from '../ResourceSetSelector';
import CompareActionBar from './CompareActionBar';
import CompareModalSelecting from './CompareModalSelecting';
import * as S from './CompareSyncPane.styled';
import InspectionActionBar from './InspectionActionBar';

const CompareSyncPane: React.FC = () => {
  const isInspecting = useAppSelector(state => state.compare.current.inspect);
  const status = useAppSelector(state => selectCompareStatus(state.compare));

  const [containerRef, {height}] = useMeasure<HTMLDivElement>();

  return (
    <S.CompareSyncPaneContainer>
      <TitleBar title="Sync & compare" description={isInspecting ? <InspectionActionBar /> : <CompareActionBar />} />

      <Row ref={containerRef}>
        <Col span={10}>
          <ResourceSetSelector side="left" />
        </Col>
        <Col span={4} />
        <Col span={10}>
          <ResourceSetSelector side="right" />
        </Col>
      </Row>

      <S.Content>{status === 'selecting' ? <CompareModalSelecting /> : <CompareModalComparing />}</S.Content>
    </S.CompareSyncPaneContainer>
  );
};

export default CompareSyncPane;
