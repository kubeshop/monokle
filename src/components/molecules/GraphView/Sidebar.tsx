import React, {useCallback, useEffect} from 'react';
// @ts-ignore
import {Easing, Tween, autoPlay} from 'es6-tween';
import {useStore, useZoomPanHelper} from 'react-flow-renderer';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAutoZoom} from '@redux/reducers/appConfig';
import {Button, Checkbox, Space} from 'antd';

autoPlay(true);

const TRANSITION_TIME = 300;
const EASING = Easing.Quadratic.Out;

const Sidebar = (reactFlow: any) => {
  const store = useStore();
  const dispatch = useAppDispatch();
  const zoomPanHelper = useZoomPanHelper();
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const settings = useAppSelector(state => state.config.settings);

  const performTransform = useCallback(
    (transform: any) => {
      if (reactFlow.reactFlow) {
        const {
          position: [x, y],
          zoom,
        } = reactFlow.reactFlow.toObject();

        new Tween({x: -x + 300, y: -y + 300, zoom})
          .to(transform, TRANSITION_TIME)
          .easing(EASING)
          // @ts-ignore
          .on('update', ({x: xPos, y: yPos, zoom: zoomLevel}) =>
            // @ts-ignore
            zoomPanHelper.setCenter(xPos, yPos, zoomLevel)
          )
          .start();
      }
    },
    [zoomPanHelper]
  );

  const selectSelectedResource = useCallback(() => {
    if (selectedResourceId) {
      const {nodes} = store.getState();

      if (nodes.length) {
        const node = nodes.find(n => n.id === selectedResourceId);
        if (node) {
          if (node.data.wasSelectedInGraphView === true) {
            node.data.wasSelectedInGraphView = false;
          } else {
            const x = node.__rf.position.x + node.__rf.width / 2;
            const y = node.__rf.position.y + node.__rf.height / 2;

            performTransform({x, y, zoom: 1});
          }
        }
      }
    }
  }, [selectedResourceId, store, performTransform]);

  useEffect(() => {
    if (settings.autoZoomGraphOnSelection) {
      selectSelectedResource();
    }
  }, [selectedResourceId, settings.autoZoomGraphOnSelection, selectSelectedResource]);

  const onZoomChange = useCallback(
    (e: any) => {
      dispatch(setAutoZoom(e.target.checked));
    },
    [dispatch]
  );

  function fit() {
    zoomPanHelper.fitView();
  }

  const handleZoom = useCallback(
    ratio => () => {
      const zoomLevel = store.getState().transform[2];
      new Tween({zoom: zoomLevel})
        .to({zoom: zoomLevel * ratio}, TRANSITION_TIME)
        .easing(EASING)
        // @ts-ignore
        .on('update', ({zoom}) => {
          zoomPanHelper.zoomTo(zoom);
        })
        .start();
    },
    [zoomPanHelper, store]
  );

  return (
    <aside>
      <Space>
        <Button type="primary" onClick={fit}>
          Fit view
        </Button>
        <Button type="primary" onClick={handleZoom(1.4)}>
          Zoom in
        </Button>
        <Button type="primary" onClick={handleZoom(1 / 1.4)}>
          Zoom out
        </Button>
        <Button type="primary" onClick={selectSelectedResource} disabled={selectedResourceId === undefined}>
          Zoom on selected resource
        </Button>
        <Checkbox onChange={onZoomChange} checked={settings.autoZoomGraphOnSelection === true}>
          auto-zoom
        </Checkbox>
      </Space>
    </aside>
  );
};

export default Sidebar;
