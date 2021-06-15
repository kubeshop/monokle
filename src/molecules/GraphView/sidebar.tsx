import React, { useEffect } from 'react';
import { useStore, useZoomPanHelper } from 'react-flow-renderer';
import { useAppSelector } from '../../redux/hooks';

const Sidebar = () => {
  const store = useStore();
  const { setCenter, fitView } = useZoomPanHelper();
  const selectedResource = useAppSelector(state => state.main.selectedResource);

  function selectSelectedResource() {
    if (selectedResource) {
      const { nodes } = store.getState();

      if (nodes.length) {
        const node = nodes.find(node => node.id === selectedResource);
        if (node) {
          const x = node.__rf.position.x + node.__rf.width / 2;
          const y = node.__rf.position.y + node.__rf.height / 2;
          const zoom = 1;

          setCenter(x, y, zoom);
        }
      }
    }
  }

  function fit() {
    fitView();
  }

  useEffect(() => {
    selectSelectedResource();
  }, [selectedResource]);

  return (
    <aside>
      <div className='description'>
        This is an example of how you can use the zoom pan helper hook
      </div>
      <button onClick={selectSelectedResource} disabled={selectedResource === undefined}>Selected resource</button>
      <button onClick={fit}>Fit view</button>
    </aside>
  );
};

export default Sidebar;
