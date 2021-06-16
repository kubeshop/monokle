import * as React from 'react';
import { Row } from 'react-bootstrap';
import ReactFlow, {
  Edge,
  Node,
  isNode,
  Position,
  MiniMap,
  ReactFlowProvider,
} from 'react-flow-renderer';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { K8sResource, ResourceRef } from '../../models/state';
import { useCallback, useEffect, useState } from 'react';
import dagre from 'dagre';
import { isIncomingRef } from '../../redux/utils/resource';
import { selectK8sResource } from '../../redux/reducers/main';
import Sidebar from './sidebar';

function mapResourceToElement(resource: K8sResource): Node {
  return {
    id: resource.id,
    data: {
      label: resource.name,
      wasSelectedInGraphView: false,
    },
    position: { x: 0, y: 0 },
    style: { background: resource.selected ? 'lighblue' : resource.highlight ? 'lightgreen' : 'white' },
  };
}

function mapRefToElement(source: K8sResource, ref: ResourceRef): Edge {
  return {
    id: source.id + '-' + ref.targetResourceId + '-' + ref.refType,
    target: source.id,
    source: ref.targetResourceId,
    animated: false,
    type: 'smoothstep',
  };
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (elements: any[]): any => {
  dagreGraph.setGraph({ rankdir: 'LR', ranksep: 50 });

  elements.forEach((el) => {
    if (isNode(el)) {
      dagreGraph.setNode(el.id, { width: 150, height: 30 });
    } else {
      if (isIncomingRef(el.data?.refType)) {
        dagreGraph.setEdge(el.source, el.target);
      } else {
        dagreGraph.setEdge(el.target, el.source);
      }
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

const GraphView = () => {
  const rootFolder = useAppSelector(state => state.main.rootFolder);
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  const dispatch = useAppDispatch();
  const [reactFlow, setReactFlow] = useState();
  const [nodes, setNodes] = useState<any[]>([]);

  function updateGraph(data: any[]) {
    if (reactFlow) {
      setNodes(getLayoutedElements(data));
      // @ts-ignore
      reactFlow.fitView();
    }
  }

  function getElementData(resource: K8sResource) {
    let data: any[] = [mapResourceToElement(resource)];
    if (resource.refs) {
      const refs = resource.refs.map(ref => mapRefToElement(resource, ref));
      data = data.concat(refs);
    }
    return data;
  }

  useEffect(() => {
    let data: any[] = [];
    Object.values(resourceMap).forEach(r => data = data.concat(getElementData(r)));
    updateGraph(data);
    setNodes(data);
    console.log('updated graph...');
  }, [rootFolder]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map(nd => {
        const resource = resourceMap[nd.id];
        if (resource) {
          nd.style = { background: resource.selected ? 'lightblue' : resource.highlight ? 'lightgreen' : 'white' };
        }
        return nd;
      }),
    );
  }, [resourceMap, setNodes]);

  const onLoad = useCallback((instance) => {
    instance.fitView();
    setReactFlow(instance);
  }, []);

  const onSelectionChange = (elements: any) => {
    if (elements && elements[0]) {
      elements[0].data.wasSelectedInGraphView = true;
      dispatch(selectK8sResource(elements[0].id));
    }
  };

  return (
    <Row>
      <span style={{ width: 600, height: 600 }}>
        <div className='zoompanflow'>
          <ReactFlowProvider>
            <div className='reactflow-wrapper' style={{ width: 600, height: 600 }}>
              <ReactFlow
                minZoom={0.1}
                panOnScroll={true}
                nodesConnectable={false}
                onLoad={onLoad}
                onSelectionChange={onSelectionChange}
                elements={nodes}>
                  <MiniMap
                    nodeColor={(node) => {
                      switch (node.type) {
                        case 'input':
                          return 'red';
                        case 'default':
                          return '#00ff00';
                        case 'output':
                          return 'rgb(0,0,255)';
                        default:
                          return '#eee';
                      }
                    }}
                    nodeStrokeWidth={3} />
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
