import {useMeasure} from 'react-use';

import {Col, Row} from 'antd';

import {selectCompareStatus} from '@redux/compare';
import {useAppSelector} from '@redux/hooks';

import {TitleBar} from '@monokle/components';

import {ResourceSetSelector} from '../ResourceSetSelector';
import CompareActionBar from './CompareActionBar';
import CompareModalComparing from './CompareModalComparing';
import CompareModalSelecting from './CompareModalSelecting';
import * as S from './CompareSyncPane.styled';
import InspectionActionBar from './InspectionActionBar';
import TransferButton from './TransferButton';

const CompareSyncPane: React.FC = () => {
  const inspection = useAppSelector(state => state.compare.current.inspect);
  const status = useAppSelector(state => selectCompareStatus(state.compare));

  const [containerRef, {height}] = useMeasure<HTMLDivElement>();

  return (
    <S.CompareSyncPaneContainer>
      <TitleBar title="Sync & compare" description={!inspection ? <CompareActionBar /> : <InspectionActionBar />} />

      <Row ref={containerRef}>
        <Col span={10}>
          <ResourceSetSelector side="left" />
        </Col>
        <Col span={4} />
        <Col span={10}>
          <ResourceSetSelector side="right" />
        </Col>
      </Row>

      <S.Content style={{height: `calc(100% - ${height}px - 100px - 60px)`}}>
        {status === 'selecting' ? <CompareModalSelecting /> : <CompareModalComparing />}
      </S.Content>

      {!inspection || inspection?.type === 'diff' ? (
        <S.ActionsRow>
          <Col span={10}>
            <TransferButton side="left" />
          </Col>
          <Col span={4} />
          <Col span={10}>
            <TransferButton side="right" />
          </Col>
        </S.ActionsRow>
      ) : null}
    </S.CompareSyncPaneContainer>
  );
};

export default CompareSyncPane;
