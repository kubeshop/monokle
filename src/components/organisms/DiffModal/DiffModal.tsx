/* eslint-disable no-restricted-syntax */
import React, {useCallback, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useWindowSize} from 'react-use';

import {Button, Checkbox, Col, Divider, Dropdown, Input, Menu, Modal, Row, Space, Tag, Tooltip} from 'antd';
import {CheckboxChangeEvent} from 'antd/lib/checkbox';

import {ClearOutlined, DownOutlined, ReloadOutlined} from '@ant-design/icons';

import {groupBy} from 'lodash';
import styled from 'styled-components';

import {
  CompareState,
  resourceSetCleared,
  resourceSetRefreshed,
  resourceSetSelected,
  selectCompareStatus,
} from '@redux/reducers/compare';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

import DiffDoubleFigure from '@assets/DiffDoubleFigure.svg';
import DiffSingleFigure from '@assets/DiffSingleFigure.svg';

import Colors, {FontColors} from '@styles/Colors';

import {DiffData, ResourceSet, ResourceSetData} from './DiffState';

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
 * Diff comparison list
 * * * * * * * * * * * * * */
type ComparisonItem = {
  type: 'comparison';
  id: string;
  namespace: string;
  name: string;
  leftActive: boolean;
  rightActive: boolean;
  canDiff: boolean;
};

const HeaderRow = styled(Row)`
  height: 28px;
  margin-left: 8px;
  font-size: 16px;
`;

const ComparisonRow = styled(Row)`
  height: 28px;
  margin-left: 8px;
  font-size: 16px;
`;

const DiffLabel = styled.span`
  color: #1f1f1f;
`;

function DiffComparisonList({data}: {data: DiffData}) {
  const rows = useMemo(() => {
    const groups = groupBy(data.comparisons, r => {
      if (r.isMatch) return r.left.kind;
      return r.left ? r.left.kind : r.right.kind;
    });
    const result: Array<HeaderItem | ComparisonItem> = [];

    for (const [kind, comparisons] of Object.entries(groups)) {
      result.push({type: 'header', kind, count: comparisons.length});

      for (const comparison of comparisons) {
        if (comparison.isMatch) {
          result.push({
            type: 'comparison',
            id: comparison.id,
            name: comparison.left.name,
            namespace: comparison.left.namespace ?? 'default',
            leftActive: true,
            rightActive: true,
            canDiff: comparison.isDifferent,
          });
        } else {
          result.push({
            type: 'comparison',
            id: comparison.id,
            name: comparison.left?.name ?? comparison.right?.name ?? 'unknown',
            namespace: comparison.left?.namespace ?? comparison.right?.namespace ?? 'default',
            leftActive: Boolean(comparison.left),
            rightActive: Boolean(comparison.right),
            canDiff: false,
          });
        }
      }
    }

    return result;
  }, [data.comparisons]);

  const handleSelect = useCallback((id: string, checked: boolean) => {
    console.log('dispatch ComparisonSelected', {id, value: checked});
  }, []);

  return (
    <div>
      {rows.map(row => {
        if (row.type === 'header') {
          const {kind, count: resourceCount} = row;
          return (
            <HeaderRow key={kind}>
              <Col span={11}>
                <Header>
                  {kind} <ResourceCount>{resourceCount}</ResourceCount>
                </Header>
              </Col>

              <Col span={2} />

              <Col span={11}>
                <Header>
                  {kind} <ResourceCount>{resourceCount}</ResourceCount>
                </Header>
              </Col>
            </HeaderRow>
          );
        }

        const {id, namespace, name, leftActive, rightActive, canDiff} = row;
        return (
          <ComparisonRow key={id}>
            <Col span={11}>
              <ResourceDiv>
                <Checkbox style={{marginRight: 16}} onChange={e => handleSelect(id, e.target.checked)} />
                <ResourceNamespace>{namespace}</ResourceNamespace>
                <ResourceName $isActive={leftActive}>{name}</ResourceName>
              </ResourceDiv>
            </Col>
            <Col span={2} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {canDiff ? (
                <Button type="primary" shape="round" size="small">
                  <DiffLabel>diff</DiffLabel>
                </Button>
              ) : null}
            </Col>

            <Col span={11}>
              <ResourceDiv>
                <ResourceNamespace>{namespace}</ResourceNamespace>
                <ResourceName $isActive={rightActive}>{name}</ResourceName>
              </ResourceDiv>
            </Col>
          </ComparisonRow>
        );
      })}
    </div>
  );
}

/* * * * * * * * * * * * * *
 * Diff set list
 * * * * * * * * * * * * * */

// TODO is this needed?
const SetListDiv = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: scroll;
`;

const HeaderDiv = styled.div`
  height: 28px;
  margin-left: 8px;
  font-size: 16px;
`;

const Header = styled.h1`
  padding: 0;
  margin-bottom: 0px;
  font-size: 18px;
  line-height: 22px;
`;

const ResourceCount = styled.span`
  margin-left: 6px;
  font-size: 14px;
  color: ${FontColors.grey};
`;

const ResourceDiv = styled.div`
  height: 28px;
  display: flex;
  align-items: center;
  margin-left: 8px;
`;

const ResourceNamespace = styled(Tag)`
  height: 22px;
  margin: 1px 8px 1px 0px;
  width: 72px;
  text-align: center;
  color: ${Colors.whitePure};
  font-size: 12px;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ResourceName = styled.span<{$isActive?: boolean}>`
  font-size: 14px;
  font-weight: 400;
  line-height: 25px;
  color: ${({$isActive = true}) => ($isActive ? Colors.whitePure : Colors.grey5b)};
`;

type HeaderItem = {
  type: 'header';
  kind: string;
  count: number;
};

type ResourceItem = {
  type: 'resource';
  id: string;
  namespace: string;
  name: string;
};

function DiffSetList({data, showCheckbox = false}: {data: ResourceSetData; showCheckbox?: boolean}) {
  const rows = useMemo(() => {
    const groups = groupBy(data.resources, r => r.kind);
    const result: Array<HeaderItem | ResourceItem> = [];

    for (const [kind, resources] of Object.entries(groups)) {
      result.push({type: 'header', kind, count: resources.length});

      for (const {id, name, namespace} of resources) {
        result.push({type: 'resource', id, name, namespace: namespace ?? 'default'});
      }
    }

    return result;
  }, [data.resources]);

  return (
    <SetListDiv>
      {rows.map(row => {
        if (row.type === 'header') {
          const {kind, count: resourceCount} = row;
          return (
            <HeaderDiv key={kind}>
              <Header>
                {kind} <ResourceCount>{resourceCount}</ResourceCount>
              </Header>
            </HeaderDiv>
          );
        }

        const {id, namespace, name} = row;
        return (
          <ResourceDiv key={id}>
            {showCheckbox ? <Checkbox style={{marginRight: 16}} disabled /> : null}
            <ResourceNamespace>{namespace}</ResourceNamespace>
            <ResourceName>{name}</ResourceName>
          </ResourceDiv>
        );
      })}
    </SetListDiv>
  );
}

/* * * * * * * * * * * * * *
 * Diff figures
 * * * * * * * * * * * * * */
const FigureDiv = styled.div`
  display: 'flex';
  flex-direction: 'column';
  width: '100%';
  height: '100%';
  align-items: 'center';
  justify-content: 'center';
`;

const FigureTitle = styled.h1`
  font-size: medium;
  font-weight: bold;
`;

const FigureDescription = styled.p`
  font-size: small;
  font-weight: normal;
`;

function DiffFigure({
  src,
  title,
  description,
  color = Colors.whitePure,
}: {
  src: string;
  title?: string;
  description?: string;
  color?: Colors;
}) {
  return (
    <FigureDiv
      style={{
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img src={src} />

      <div style={{width: 350, paddingTop: 24, textAlign: 'center'}}>
        {title ? <FigureTitle style={{color}}>{title}</FigureTitle> : null}
        {description ? <FigureDescription style={{color}}>{description} </FigureDescription> : null}
      </div>
    </FigureDiv>
  );
}

/* * * * * * * * * * * * * *
 * Set selector
 * * * * * * * * * * * * * */
const DiffSetSelectorDiv = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-radius: 2;
  background-color: #31393c;
  margin-bottom: 16px;
`;

const resourceSetLabelMap: Record<ResourceSet['type'], string> = {
  local: 'Local',
  cluster: 'Cluster',
  helm: 'Helm Preview',
  kustomize: 'Kustomize',
};

function ResourceSetSelector({side}: {side: 'left' | 'right'}) {
  const dispatch = useDispatch();
  const resourceSet = useSelector((state: PartialStore) => {
    const view = state.compare.current.view;
    return side === 'left' ? view.leftSet : view.rightSet;
  });

  const handleSelect = useCallback(
    (type: string) => {
      const value: ResourceSet = type === 'local' ? {type: 'local'} : {type: 'cluster', context: 'somecontext'};
      dispatch(resourceSetSelected({side, value}));
    },
    [dispatch, side]
  );

  const handleRefresh = useCallback(() => {
    dispatch(resourceSetRefreshed({side}));
  }, [dispatch, side]);

  const handleClear = useCallback(() => {
    dispatch(resourceSetCleared({side}));
  }, [dispatch, side]);

  const menu = (
    <Menu>
      <Menu.Item key="local" onClick={() => handleSelect('local')}>
        Local
      </Menu.Item>
      <Menu.Item key="cluster" onClick={() => handleSelect('cluster')}>
        Cluster
      </Menu.Item>
    </Menu>
  );

  return (
    <DiffSetSelectorDiv>
      <Dropdown overlay={menu}>
        <Button style={{width: 180, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          {resourceSet ? resourceSetLabelMap[resourceSet.type] : 'Choose...'}
          <DownOutlined />
        </Button>
      </Dropdown>

      <div>
        <Tooltip title="Reload resources" placement="bottom">
          <Button type="link" size="middle" icon={<ReloadOutlined />} onClick={handleRefresh} />
        </Tooltip>

        <Tooltip title="Clear resources" placement="bottom">
          <Button type="link" size="middle" icon={<ClearOutlined />} onClick={handleClear} />
        </Tooltip>
      </div>
    </DiffSetSelectorDiv>
  );
}

/* * * * * * * * * * * * * *
 * Action bar
 * * * * * * * * * * * * * */
const ActionBarDiv = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  margin-bottom: 6px;
  border-radius: 2px;
  background-color: #31393c80;
  color: #5a5a5a;
`;

const ActionBarRightDiv = styled.div`
  display: flex;
  align-items: center;
`;

function DiffActionBar() {
  const disabled = false;
  const namespaces = ['default', 'demo'];

  const handleSelectAll = useCallback((event: CheckboxChangeEvent) => {
    const value = event.target.checked;
    console.log('dispatch ComparisonAllSelected', {value});
  }, []);

  const handleSelectNamespace = useCallback((namespace: string) => {
    console.log('dispatch FilterUpdated', {namespace});
  }, []);

  const handleSaveView = useCallback(() => {
    console.log('dispatch ViewSaved');
  }, []);

  const handleLoadView = useCallback(() => {
    console.log('dispatch ViewLoaded');
  }, []);

  const menu = (
    <Menu>
      {namespaces.map(namespace => {
        return (
          <Menu.Item key={namespace} onClick={() => handleSelectNamespace(namespace)}>
            {namespace}
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
    <ActionBarDiv>
      <div>
        <Checkbox disabled={disabled} onChange={handleSelectAll}>
          Select all
        </Checkbox>
      </div>

      <ActionBarRightDiv>
        <Space>
          <Input disabled={disabled} value="search" />
          {/* <Dropdown overlay={menu}> */}
          <Dropdown disabled={disabled} overlay={menu}>
            <Button>
              <Space>
                All namespaces
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>

          <Divider type="vertical" style={{height: 28}} />

          <Button disabled={disabled} onClick={handleSaveView}>
            Save Diff
          </Button>

          <Button disabled={disabled} onClick={handleLoadView}>
            Load Diff
          </Button>
        </Space>
      </ActionBarRightDiv>
    </ActionBarDiv>
  );
}

/* * * * * * * * * * * * * *
 * Modal footer
 * * * * * * * * * * * * * */
const StyledButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

function DiffModalFooter({onClose}: {onClose: () => void}) {
  return (
    <StyledButtonsContainer>
      <div />

      <Button type="link" onClick={onClose}>
        Close
      </Button>
    </StyledButtonsContainer>
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
