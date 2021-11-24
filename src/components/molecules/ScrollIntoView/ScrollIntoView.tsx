import React from 'react';

interface ScrollIntoViewProps {
  children: React.ReactNode;
  id: string;
}

export type ScrollContainerRef = {
  scrollIntoView: () => void;
  getBoundingClientRect: () => DOMRect | undefined;
};

const ScrollIntoView = React.forwardRef(({children, id}: ScrollIntoViewProps, ref) => {
  const containerRef = React.useRef<HTMLSpanElement>(null);
  React.useImperativeHandle(ref, () => {
    return {
      scrollIntoView: () => {
        containerRef.current?.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'});
      },
      getBoundingClientRect: () => {
        return containerRef.current?.getBoundingClientRect();
      },
    };
  });

  return (
    <span id={id} ref={containerRef}>
      {children}
    </span>
  );
});

export default ScrollIntoView;
