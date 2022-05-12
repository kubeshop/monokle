import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Col, Row} from 'antd';

import styled from 'styled-components';

import {CompareSide, resourceSetRefreshed} from '@redux/reducers/compare';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

import DiffDoubleFigure from '@assets/DiffDoubleFigure.svg';
import DiffSingleFigure from '@assets/DiffSingleFigure.svg';
import ErrorFigure from '@assets/figures/crash.svg';

import Colors from '@styles/Colors';

import {DiffFigure, FigureDescription, FigureTitle} from './CompareFigure';
import {PartialStore} from './CompareModal';
import {DiffSetList} from './ResourceList';

const ListRow = styled(Row)`
  margin-right: -23px;
  overflow: auto;
  ${GlobalScrollbarStyle}
`;

const FloatingFigure = styled.div<{side: 'left' | 'right'; noEvents?: boolean}>`
  position: absolute;
  ${({side}) => (side === 'left' ? 'left: 0;' : 'right: 0;')}
  top: 72px;
  width: 45%;
  height: calc(100% - 72px);
  overflow: hidden;
  pointer-events: ${props => (props.noEvents ? 'none' : 'auto')};
`;

const RetrySpan = styled.span`
  text-decoration: underline;
  cursor: pointer;
`;

export function CompareModalSelecting() {
  const dispatch = useDispatch();
  const {left, right} = useSelector((state: PartialStore) => state.compare.current);
  const leftSuccess = left && !left.loading && !left.error;
  const rightSuccess = right && !right.loading && !right.error;

  const handleRetry = useCallback((side: CompareSide) => {
    dispatch(resourceSetRefreshed({side}));
  }, []);

  const ErrorFigureLeft = () => (
    <DiffFigure src={ErrorFigure}>
      <FigureTitle color={Colors.red7}>Cannot retrieve resources</FigureTitle>
      <FigureDescription color={Colors.grey8}>
        <RetrySpan onClick={() => handleRetry('left')}>Try again</RetrySpan> or select different resources
      </FigureDescription>
    </DiffFigure>
  );

  const ErrorFigureRight = () => (
    <DiffFigure src={ErrorFigure}>
      <FigureTitle color={Colors.red7}>Cannot retrieve resources</FigureTitle>
      <FigureDescription color={Colors.grey8}>
        <RetrySpan onClick={() => handleRetry('right')}>Try again</RetrySpan> or select different resources
      </FigureDescription>
    </DiffFigure>
  );

  if (leftSuccess && rightSuccess) {
    // Invalid state - it should be comparing.
    return <div />;
  }

  if (left && !rightSuccess) {
    return (
      <>
        <ListRow style={{height: 'calc(100% - 72px)'}}>
          <Col span={11}>
            {left.loading ? (
              <div>loading...</div>
            ) : left.error ? (
              <ErrorFigureLeft />
            ) : (
              <DiffSetList data={left} showCheckbox />
            )}
          </Col>
        </ListRow>

        <FloatingFigure side="right" noEvents={!right?.error}>
          {!right ? (
            <DiffFigure src={DiffSingleFigure}>
              <FigureDescription color={Colors.grey8}>Now, something here</FigureDescription>
            </DiffFigure>
          ) : right.error ? (
            <ErrorFigureRight />
          ) : (
            <p>loading..</p>
          )}
        </FloatingFigure>
      </>
    );
  }

  if (right && !leftSuccess) {
    return (
      <>
        <ListRow style={{height: 'calc(100% - 72px)'}}>
          <Col span={13} />

          <Col span={11}>
            {right.loading ? (
              <div>loading...</div>
            ) : right.error ? (
              <ErrorFigureRight />
            ) : (
              <DiffSetList data={right} showCheckbox />
            )}
          </Col>
        </ListRow>

        <FloatingFigure side="left" noEvents={!left?.error}>
          {!left ? (
            <DiffFigure src={DiffSingleFigure}>
              <FigureDescription color={Colors.grey8}>Now, something here</FigureDescription>
            </DiffFigure>
          ) : left.error ? (
            <ErrorFigureLeft />
          ) : (
            <p>loading..</p>
          )}
        </FloatingFigure>
      </>
    );
  }

  return (
    <Row style={{height: 'calc(100% - 72px)'}}>
      <DiffFigure src={DiffDoubleFigure}>
        <FigureTitle>Compare (almost) anything!</FigureTitle>
        <FigureDescription>
          Choose a local resource, Kustomize / Helm preview or a cluster in any of the sides to start your diff.
        </FigureDescription>
      </DiffFigure>
    </Row>
  );
}
