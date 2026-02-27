import React from 'react';

import type { C0Action } from '../../types.js';

export interface DefaultImageProps {
  images?: Array<{ src: string; alt?: string; caption?: string }>;
  display?: 'grid' | 'carousel' | 'single';
  onAction?: (action: C0Action) => void;
}

export function DefaultImage({ images, display = 'grid' }: DefaultImageProps) {
  if (!images?.length) return <div className="c0-image-empty">No images</div>;
  return (
    <div className={`c0-image c0-image-${display}`}>
      {images.map((img, i) => (
        <figure key={i} className="c0-image-item">
          <img src={img.src} alt={img.alt ?? ''} className="c0-image-img" />
          {img.caption && <figcaption className="c0-image-caption">{img.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}
