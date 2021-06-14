import * as React from 'react';
import { Row } from 'react-bootstrap';
import ReactFlow, { Edge, Node, isNode, Position } from 'react-flow-renderer';
import { useAppSelector } from '../../redux/hooks';
import { K8sResource, ResourceRef } from '../../models/state';
import { useEffect, useState } from 'react';
import { getLinkedResources } from '../../redux/utils/selection';
import dagre from 'dagre';
import { isIncomingRef } from '../../redux/utils/resource';
import { getFileEntryForPath } from '../../redux/utils/fileEntry';

function mapResourceToElement(resource: K8sResource): Node {
  return {
    id: resource.id,
    data: { label: resource.name },
    position: { x: 0, y: 0 },
  };
}

function mapRefToElement(source: K8sResource, ref: ResourceRef): Edge {
  return {
    id: source.id + '-' + ref.targetResourceId + '-' + ref.refType,
    target: source.id,
    source: ref.targetResourceId,
    animated: false,
    type: 'smoothstep',
    data: {
      refType: ref.refType,
    },
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

  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const rootEntry = useAppSelector(state => state.main.rootEntry);
  const [data, setData] = useState<any>([]);
  const [reactFlow, setReactFlow] = useState();

  function updateGraph(data: any[]) {
    if (reactFlow) {
      setData(getLayoutedElements(data));
      // @ts-ignore
      reactFlow.fitView();
    }
  }

  function getElementData(resource: K8sResource) {
    const linkedResources = getLinkedResources(resource);
    let data: any[] = [mapResourceToElement(resource)];
    data = data.concat(linkedResources.map(id => resourceMap[id]).map(r => mapResourceToElement(r)));
    if (resource.refs) {
      const refResources = resource.refs.filter(ref => linkedResources.includes(ref.targetResourceId));
      const refs = refResources.map(ref => mapRefToElement(resource, ref));
      data = data.concat(refs);
    }
    return data;
  }

  useEffect(() => {
    if (selectedResource) {
      const resource = resourceMap[selectedResource];
      if (resource) {
        const data = getElementData(resource);
        updateGraph(data);
      }
    } else if (selectedPath) {
      const fileEntry = getFileEntryForPath(selectedPath, rootEntry);
      if (fileEntry && fileEntry.resourceIds) {
        let data: any[] = [];
        fileEntry.resourceIds.map(id => resourceMap[id]).forEach(r => data = data.concat(getElementData(r)));
        updateGraph(data);
      }
    } else {
      updateGraph([]);
    }
  }, [selectedResource, resourceMap, selectedPath, rootEntry, reactFlow]);

  const onLoad = (reactFlowInstance: any) => {
    setReactFlow(reactFlowInstance);
  };

  return (
    <Row>
      <span style={{ width: 600, height: 600 }}>
        <ReactFlow
          panOnScroll={true}
          nodesConnectable={false}
          onLoad={onLoad}
          elements={data} />
      </span>
    </Row>
  );
};

export default GraphView;
