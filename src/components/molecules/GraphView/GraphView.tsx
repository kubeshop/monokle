import * as React from 'react';
import {useCallback, useEffect, useState} from 'react';
import ReactFlow, {Edge, MiniMap, Node, Position, ReactFlowProvider, isNode} from 'react-flow-renderer';
import {useSelector} from 'react-redux';
import {useMeasure} from 'react-use';

import {Row} from 'antd';

import dagre from 'dagre';

import {K8sResource, ResourceRef} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectK8sResource} from '@redux/reducers/main';
import {activeResourcesSelector} from '@redux/selectors';
import {isIncomingRef, isUnsatisfiedRef} from '@redux/services/resourceRefs';

import Sidebar from './Sidebar';

function mapResourceToElement(resource: K8sResource): Node {
  return {
    id: resource.id,
    data: {
      label: resource.name,
      wasSelectedInGraphView: false,
    },
    position: {x: 0, y: 0},
    style: {background: resource.isSelected ? 'lighblue' : resource.isHighlighted ? 'lightgreen' : 'white'},
  };
}

function mapRefToElement(source: K8sResource, ref: ResourceRef): Edge | undefined {
  if (ref.target?.type === 'resource') {
    return {
      id: `${source.id}-${ref.target.resourceId}-${ref.type}`,
      source: source.id,
      target: ref.target.resourceId || ref.name,
      animated: false,
      type: 'smoothstep',
    };
  }
  return undefined;
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (elements: any[]): any => {
  dagreGraph.setGraph({rankdir: 'LR', ranksep: 50});

  elements.forEach(el => {
    if (isNode(el)) {
      dagreGraph.setNode(el.id, {width: 150, height: 30});
    } else if (isIncomingRef(el.data?.refType)) {
      dagreGraph.setEdge(el.source, el.target);
    } else {
      dagreGraph.setEdge(el.target, el.source);
    }
  });

  dagre.layout(dagreGraph);

  return elements.map((el: any) => {
    if (isNode(el)) {
      const nodeWithPosition = dagreGraph.node(el.id);
      el.targetPosition = Position.Right;
      el.sourcePosition = Position.Left;

      // unfortunately we need this little hack to pass a slightly different position
      // to notify react flow about the change. Moreover we are shifting the dagre node position
      // (anchor=center center) to the top left so it matches the react flow node anchor point (top left).
      el.position = {
        x: nodeWithPosition.x - 150 / 2 + Math.random() / 1000,
        y: nodeWithPosition.y - 30 / 2,
      };
    }

    return el;
  });
};

interface IProps {
  editorHeight: number;
}

const GraphView: React.FC<IProps> = props => {
  const {editorHeight} = props;
  const graphAreaHeight = editorHeight - 150;
  const fileMap = useAppSelector(state => state.main.fileMap);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const activeResources = useSelector(activeResourcesSelector);

  const dispatch = useAppDispatch();
  const [reactFlow, setReactFlow] = useState();
  const [nodes, setNodes] = useState<any[]>([]);
  const [containerRef, {width}] = useMeasure<HTMLDivElement>();

  function updateGraph(data: any[]) {
    if (reactFlow) {
      setNodes(getLayoutedElements(data));
    }
  }

  function getElementData(resource: K8sResource) {
    let data: any[] = [mapResourceToElement(resource)];
    if (resource.refs) {
      const refs = resource.refs
        .filter(ref => !isUnsatisfiedRef(ref.type))
        .map(ref => mapRefToElement(resource, ref))
        .filter(ref => Boolean(ref));
      data = data.concat(refs);
    }
    return data;
  }

  useEffect(() => {
    let data: any[] = [];
    activeResources
      .filter(r => r.refs)
      .forEach(r => {
        data = data.concat(getElementData(r));
      });
    updateGraph(data);
    setNodes(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileMap, activeResources]);

  useEffect(() => {
    setNodes(nds =>
      nds.map(nd => {
        const resource = resourceMap[nd.id];
        if (resource) {
          nd.style = {background: resource.isSelected ? 'lightblue' : resource.isHighlighted ? 'lightgreen' : 'white'};
        }
        return nd;
      })
    );
  }, [resourceMap, setNodes]);

  const onLoad = useCallback(instance => {
    setReactFlow(instance);
  }, []);

  const onSelectionChange = (elements: any) => {
    if (elements && elements[0]) {
      elements[0].data.wasSelectedInGraphView = true;
      dispatch(selectK8sResource({resourceId: elements[0].id}));
    }
  };

  return (
    <Row ref={containerRef}>
      <span style={{width, height: editorHeight}}>
        <div className="zoompanflow">
          <ReactFlowProvider>
            <div className="reactflow-wrapper" style={{width: 600, height: graphAreaHeight}}>
              <ReactFlow
                minZoom={0.1}
                panOnScroll
                nodesConnectable={false}
                onLoad={onLoad}
                onSelectionChange={onSelectionChange}
                elements={nodes}
              >
                <MiniMap
                  nodeColor={node => {
                    return node && node.style && node.style.background ? node.style.background.toString() : 'white';
                  }}
                  nodeStrokeWidth={3}
                />
              </ReactFlow>
            </div>
            <Sidebar reactFlow={reactFlow} />
          </ReactFlowProvider>
        </div>
      </span>
    </Row>
  );
};

export default GraphView;
