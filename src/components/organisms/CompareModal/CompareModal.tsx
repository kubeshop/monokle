import React from 'react';
import {useSelector} from 'react-redux';
import {useWindowSize} from 'react-use';

import {Col, Modal, Row} from 'antd';

import styled from 'styled-components';

import {CompareState, selectCompareStatus} from '@redux/reducers/compare';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

import DiffDoubleFigure from '@assets/DiffDoubleFigure.svg';
import DiffSingleFigure from '@assets/DiffSingleFigure.svg';

import Colors from '@styles/Colors';

import {DiffActionBar} from './CompareActionBar';
import {DiffFigure} from './CompareFigure';
import {DiffModalFooter} from './CompareModalFooter';
import {DiffComparisonList} from './ComparisonList';
import {DiffSetList} from './ResourceList';
import {ResourceSetSelector} from './ResourceSetSelector';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const ListRow = styled(Row)`
  margin-right: -23px;
  overflow: auto;
  ${GlobalScrollbarStyle}
`;

const FloatingFigure = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  width: 45%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
`;

export type PartialStore = {
  compare: CompareState;
};

export default function DiffModal({visible, onClose}: Props) {
  const sizeProps = useModalSize();
  const status = useSelector((state: PartialStore) => selectCompareStatus(state.compare));
  const current = useSelector((state: PartialStore) => {
    return state.compare.current;
  });

  return (
    <Modal
      title="Comparing resources"
      visible={visible}
      onCancel={onClose}
      onOk={onClose}
      footer={<DiffModalFooter onClose={onClose} />}
      {...sizeProps}
    >
      <DiffActionBar />

      <div style={{height: 'calc(100% - 66px)', position: 'relative'}}>
        <Row>
          <Col span={11}>
            <ResourceSetSelector side="left" />
          </Col>
          <Col span={2} />
          <Col span={11}>
            <ResourceSetSelector side="right" />
          </Col>
        </Row>

        {status === 'selecting' ? (
          <Row style={{height: 'calc(100% - 72px)'}}>
            <DiffFigure
              src={DiffDoubleFigure}
              title="Compare (almost) anything!"
              description="Choose a local resource, Kustomize / Helm preview or a cluster in any of the sides to start your diff."
            />
          </Row>
        ) : current.left && !current.right ? (
          <>
            <ListRow style={{height: 'calc(100% - 72px)'}}>
              <Col span={11}>
                <DiffSetList data={current.left} showCheckbox />
              </Col>
            </ListRow>

            <FloatingFigure>
              <DiffFigure src={DiffSingleFigure} description="Now, something here" color={Colors.grey8} />
            </FloatingFigure>
          </>
        ) : current.right && !current.left ? (
          <Row>
            <Col span={11}>
              <DiffFigure src={DiffSingleFigure} description="Now, something here" color={Colors.grey8} />
            </Col>

            <Col span={2} />

            <Col span={11}>
              <p>Stuff will come here</p>
            </Col>
          </Row>
        ) : status === 'comparing' ? (
          <Row>
            <Col span={24}>
              <p>comparing..</p>
            </Col>
          </Row>
        ) : (
          <Row>
            <Col span={24}>
              <DiffComparisonList data={current.diff!} />
            </Col>
          </Row>
        )}
      </div>
    </Modal>
  );
}

/* * * * * * * * * * * * * *
 * Modal size hook
 * * * * * * * * * * * * * */
type ModalSizeProps = {
  width: number;
  bodyStyle: {height: number};
  style: {top: number};
};

function useModalSize(): ModalSizeProps {
  const windowSize = useWindowSize();
  const modalHeaderHeight = 55;
  const percentage = 0.85;

  return {
    width: windowSize.width * percentage,
    bodyStyle: {
      height: (windowSize.height - modalHeaderHeight) * percentage,
    },
    style: {
      top: 25,
    },
  };
}
