import { useCallback, useRef } from 'react';

export default function useDragScroll() {
  const cleanupsRef = useRef([]);

  const refCallback = useCallback((node) => {
    // Run cleanups for previous node if any
    cleanupsRef.current.forEach(cleanup => cleanup());
    cleanupsRef.current = [];

    if (!node) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    let hasMoved = false;

    const handleMouseDown = (e) => {
      // Only drag with left mouse button click
      if (e.button !== 0) return;
      isDown = true;
      startX = e.pageX - node.offsetLeft;
      scrollLeft = node.scrollLeft;
      hasMoved = false;
      node.style.cursor = 'grabbing';
      node.style.userSelect = 'none';
      node.style.scrollBehavior = 'auto'; // Disable smooth scroll during drag
    };

    const handleMouseMove = (e) => {
      if (!isDown) return;
      
      const x = e.pageX - node.offsetLeft;
      const walk = (x - startX) * 1.5; // Scroll speed factor
      
      if (Math.abs(x - startX) > 5) {
        hasMoved = true;
      }
      
      node.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      isDown = false;
      node.style.cursor = 'grab';
      node.style.removeProperty('user-select');
      node.style.removeProperty('scroll-behavior');
    };

    const handleMouseLeave = () => {
      isDown = false;
      node.style.cursor = 'grab';
      node.style.removeProperty('user-select');
      node.style.removeProperty('scroll-behavior');
    };

    const handleClick = (e) => {
      if (hasMoved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleWheel = (e) => {
      // Translate vertical mouse wheel scrolling to horizontal scroll for books list
      if (node.scrollWidth > node.clientWidth) {
        if (e.deltaY !== 0) {
          e.preventDefault();
          node.scrollLeft += e.deltaY;
        }
      }
    };

    node.style.cursor = 'grab';

    node.addEventListener('mousedown', handleMouseDown);
    node.addEventListener('mousemove', handleMouseMove);
    node.addEventListener('mouseup', handleMouseUp);
    node.addEventListener('mouseleave', handleMouseLeave);
    node.addEventListener('click', handleClick, true); // Capture phase to prevent link clicks
    node.addEventListener('wheel', handleWheel, { passive: false }); // Prevent default vertical scroll

    cleanupsRef.current.push(() => {
      node.removeEventListener('mousedown', handleMouseDown);
      node.removeEventListener('mousemove', handleMouseMove);
      node.removeEventListener('mouseup', handleMouseUp);
      node.removeEventListener('mouseleave', handleMouseLeave);
      node.removeEventListener('click', handleClick, true);
      node.removeEventListener('wheel', handleWheel);
    });
  }, []);

  return refCallback;
}
