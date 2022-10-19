import {useCallback} from 'react';

import {Col, Row, Skeleton} from 'antd';

import {CompareSide, resourceSetRefreshed} from '@redux/compare';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import CompareDoubleFigure from '@assets/figures/compareDouble.svg';
import CompareSingleFigure from '@assets/figures/compareSingle.svg';
import CrashFigure from '@assets/figures/crash.svg';

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

  if (leftSuccess && rightSuccess) {
    // Invalid state - it should be comparing.
    return <div />;
  }

  if (left && !rightSuccess) {
    return (
      <>
        <S.ListRow>
          <Col span={10}>
            {left.loading ? (
              <Skeleton />
            ) : left.error ? (
              <ErrorFigure onRetry={() => handleRetry('left')} />
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
            <ErrorFigure onRetry={() => handleRetry('right')} />
          ) : (
            <Skeleton />
          )}
        </S.FloatingFigure>
      </>
    );
  }

  if (right && !leftSuccess) {
    return (
      <>
        <S.ListRow>
          <Col span={14} />

          <Col span={10}>
            {right.loading ? (
              <div>loading...</div>
            ) : right.error ? (
              <ErrorFigure onRetry={() => handleRetry('right')} />
            ) : (
              <ResourceList data={right} />
            )}
          </Col>
        </S.ListRow>

        <S.FloatingFigure side="left" noEvents={!left?.error}>
          {!left ? (
            <CompareFigure src={CompareSingleFigure}>
              <FigureDescription color={Colors.grey8}>Now, something here</FigureDescription>
            </CompareFigure>
          ) : left.error ? (
            <ErrorFigure onRetry={() => handleRetry('left')} />
          ) : (
            <p>loading..</p>
          )}
        </S.FloatingFigure>
      </>
    );
  }

  return (
    <Row style={{height: '100%'}}>
      <CompareFigure src={CompareDoubleFigure}>
        <FigureTitle>Compare (almost) anything!</FigureTitle>
        <FigureDescription>
          Choose a local resource, Kustomize / Helm preview or a cluster in any of the sides to start your diff.
        </FigureDescription>
      </CompareFigure>
    </Row>
  );
};

type ErrorFigureProps = {
  onRetry: () => void;
};

function ErrorFigure({onRetry}: ErrorFigureProps) {
  return (
    <CompareFigure src={CrashFigure}>
      <FigureTitle color={Colors.red7}>Cannot retrieve resources</FigureTitle>
      <FigureDescription color={Colors.grey8}>
        <S.RetrySpan onClick={onRetry}>Try again</S.RetrySpan> or select different resources
      </FigureDescription>
    </CompareFigure>
  );
}
