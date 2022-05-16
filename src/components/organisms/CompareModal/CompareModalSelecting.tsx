import {useCallback} from 'react';

import {Col, Row} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {CompareSide, resourceSetRefreshed} from '@redux/reducers/compare';

import CompareDoubleFigure from '@assets/figures/compareDouble.svg';
import CompareSingleFigure from '@assets/figures/compareSingle.svg';
import ErrorFigure from '@assets/figures/crash.svg';

import Colors from '@styles/Colors';

import {CompareFigure} from './CompareFigure';
import {FigureDescription, FigureTitle} from './CompareFigure.styled';
import * as S from './CompareModalSelecting.styled';
import {ResourceList} from './ResourceList';

export const CompareModalSelecting: React.FC = () => {
  const dispatch = useAppDispatch();
  const {left, right} = useAppSelector(state => state.compare.current);
  const leftSuccess = left && !left.loading && !left.error;
  const rightSuccess = right && !right.loading && !right.error;

  const handleRetry = useCallback((side: CompareSide) => dispatch(resourceSetRefreshed({side})), [dispatch]);

  const ErrorFigureLeft = () => (
    <CompareFigure src={ErrorFigure}>
      <FigureTitle color={Colors.red7}>Cannot retrieve resources</FigureTitle>
      <FigureDescription color={Colors.grey8}>
        <S.RetrySpan onClick={() => handleRetry('left')}>Try again</S.RetrySpan> or select different resources
      </FigureDescription>
    </CompareFigure>
  );

  const ErrorFigureRight = () => (
    <CompareFigure src={ErrorFigure}>
      <FigureTitle color={Colors.red7}>Cannot retrieve resources</FigureTitle>
      <FigureDescription color={Colors.grey8}>
        <S.RetrySpan onClick={() => handleRetry('right')}>Try again</S.RetrySpan> or select different resources
      </FigureDescription>
    </CompareFigure>
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
              <ResourceList data={left} showCheckbox />
            )}
          </Col>
        </S.ListRow>

        <S.FloatingFigure side="right" noEvents={!right?.error}>
          {!right ? (
            <CompareFigure src={CompareSingleFigure}>
              <FigureDescription color={Colors.grey8}>Now, something here</FigureDescription>
            </CompareFigure>
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
            {right.loading ? <div>loading...</div> : right.error ? <ErrorFigureRight /> : <ResourceList data={right} />}
          </Col>
        </S.ListRow>

        <S.FloatingFigure side="left" noEvents={!left?.error}>
          {!left ? (
            <CompareFigure src={CompareSingleFigure}>
              <FigureDescription color={Colors.grey8}>Now, something here</FigureDescription>
            </CompareFigure>
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
      <CompareFigure src={CompareDoubleFigure}>
        <FigureTitle>Compare (almost) anything!</FigureTitle>
        <FigureDescription>
          Choose a local resource, Kustomize / Helm preview or a cluster in any of the sides to start your diff.
        </FigureDescription>
      </CompareFigure>
    </Row>
  );
};
