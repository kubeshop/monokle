import React from 'react';

interface ScrollIntoViewProps {
  children: React.ReactNode;
  id: string;
  parentContainerElementId: string;
}

export type ScrollContainerRef = {
  scrollIntoView: () => void;
  getBoundingClientRect: () => DOMRect | undefined;
};

const ScrollIntoView = React.forwardRef(({children, id, parentContainerElementId}: ScrollIntoViewProps, ref) => {
  const containerRef = React.useRef<HTMLLIElement>(null);
  React.useImperativeHandle(ref, () => {
    return {
      scrollIntoView: () => {
        // containerRef.current?.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'});
        const parentContainer = document.getElementById(parentContainerElementId);
        const itemOffsetTop = containerRef.current?.offsetTop;
        if (parentContainer && itemOffsetTop) {
          const scrollOffset = itemOffsetTop - parentContainer.scrollTop;
          parentContainer.scrollTo({
            left: 0,
            top: scrollOffset,
            behavior: 'smooth',
          });
        }
      },
      getBoundingClientRect: () => {
        return containerRef.current?.getBoundingClientRect();
      },
    };
  });

  return (
    <li style={{width: '100%'}} id={id} ref={containerRef}>
      {children}
    </li>
  );
});

export default ScrollIntoView;
