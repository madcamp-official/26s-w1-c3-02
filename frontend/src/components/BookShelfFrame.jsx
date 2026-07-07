import { useCallback, useEffect, useRef, useState } from 'react';

const FALLBACK_WIDTH = 165;

export default function BookShelfFrame({ coverImageUrl, title, children }) {
  const imageRef = useRef(null);
  const [contentWidth, setContentWidth] = useState(FALLBACK_WIDTH);

  const updateContentWidth = useCallback(() => {
    const imageWidth = imageRef.current?.getBoundingClientRect().width;

    if (imageWidth > 0) {
      setContentWidth(Math.round(imageWidth));
    }
  }, []);

  useEffect(() => {
    if (!coverImageUrl) {
      setContentWidth(FALLBACK_WIDTH);
      return undefined;
    }

    updateContentWidth();

    const image = imageRef.current;
    const observer =
      image && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updateContentWidth)
        : null;

    if (image && observer) observer.observe(image);
    window.addEventListener('resize', updateContentWidth);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateContentWidth);
    };
  }, [coverImageUrl, updateContentWidth]);

  const measuredWidthStyle = { width: `${contentWidth}px` };

  return (
    <article className="book-shelf-body h-full" style={measuredWidthStyle}>
      <div className="book-shelf-cover" style={measuredWidthStyle}>
        {coverImageUrl ? (
          <img
            ref={imageRef}
            className="book-shelf-cover__image"
            src={coverImageUrl}
            alt={`${title} cover`}
            onLoad={updateContentWidth}
          />
        ) : (
          <div className="book-shelf-cover__fallback" />
        )}
      </div>

      <div className="book-shelf-meta" style={measuredWidthStyle}>
        {children}
      </div>
    </article>
  );
}
