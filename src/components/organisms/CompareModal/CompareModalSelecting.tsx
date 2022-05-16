import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {Col, Row} from 'antd';

import {useAppSelector} from '@redux/hooks';
import {CompareSide, resourceSetRefreshed} from '@redux/reducers/compare';

import CompareDoubleFigure from '@assets/figures/compareDouble.svg';
import CompareSingleFigure from '@assets/figures/compareSingle.svg';
import ErrorFigure from '@assets/figures/crash.svg';

import Colors from '@styles/Colors';

import {DiffFigure} from './CompareFigure';
import {FigureDescription, FigureTitle} from './CompareFigure.styled';
import * as S from './CompareModalSelecting.styled';
import {DiffSetList} from './ResourceList';

export function CompareModalSelecting() {
  const dispatch = useDispatch();
  const {left, right} = useAppSelector(state => state.compare.current);
  const leftSuccess = left && !left.loading && !left.error;
  const rightSuccess = right && !right.loading && !right.error;

  const handleRetry = useCallback((side: CompareSide) => dispatch(resourceSetRefreshed({side})), [dispatch]);

  const ErrorFigureLeft = () => (
    <DiffFigure src={ErrorFigure}>
      <FigureTitle color={Colors.red7}>Cannot retrieve resources</FigureTitle>
      <FigureDescription color={Colors.grey8}>
        <S.RetrySpan onClick={() => handleRetry('left')}>Try again</S.RetrySpan> or select different resources
      </FigureDescription>
    </DiffFigure>
  );

  const ErrorFigureRight = () => (
    <DiffFigure src={ErrorFigure}>
      <FigureTitle color={Colors.red7}>Cannot retrieve resources</FigureTitle>
      <FigureDescription color={Colors.grey8}>
        <S.RetrySpan onClick={() => handleRetry('right')}>Try again</S.RetrySpan> or select different resources
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
        <S.ListRow style={{height: 'calc(100% - 72px)'}}>
          <Col span={11}>
            {left.loading ? (
              <div>loading...</div>
            ) : left.error ? (
              <ErrorFigureLeft />
            ) : (
              <DiffSetList data={left} showCheckbox />
            )}
          </Col>
        </S.ListRow>

        <S.FloatingFigure side="right" noEvents={!right?.error}>
          {!right ? (
            <DiffFigure src={CompareSingleFigure}>
              <FigureDescription color={Colors.grey8}>Now, something here</FigureDescription>
            </DiffFigure>
          ) : right.error ? (
            <ErrorFigureRight />
          ) : (
            <p>loading..</p>
          )}
        </S.FloatingFigure>
      </>
    );
  }

  if (right && !leftSuccess) {
    return (
      <>
        <S.ListRow style={{height: 'calc(100% - 72px)'}}>
          <Col span={13} />

          <Col span={11}>
            {right.loading ? <div>loading...</div> : right.error ? <ErrorFigureRight /> : <DiffSetList data={right} />}
          </Col>
        </S.ListRow>

        <S.FloatingFigure side="left" noEvents={!left?.error}>
          {!left ? (
            <DiffFigure src={CompareSingleFigure}>
              <FigureDescription color={Colors.grey8}>Now, something here</FigureDescription>
            </DiffFigure>
          ) : left.error ? (
            <ErrorFigureLeft />
          ) : (
            <p>loading..</p>
          )}
        </S.FloatingFigure>
      </>
    );
  }

  return (
    <Row style={{height: 'calc(100% - 72px)'}}>
      <DiffFigure src={CompareDoubleFigure}>
        <FigureTitle>Compare (almost) anything!</FigureTitle>
        <FigureDescription>
          Choose a local resource, Kustomize / Helm preview or a cluster in any of the sides to start your diff.
        </FigureDescription>
      </DiffFigure>
    </Row>
  );
}
