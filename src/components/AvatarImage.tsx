import React, { useState } from 'react';

interface AvatarImageProps {
  src: string;
  alt?: string;
  avatarX?: number | null;
  avatarY?: number | null;
  avatarScale?: number | null;
  className?: string;
}

export default function AvatarImage({
  src,
  alt = '',
  avatarX = 0,
  avatarY = 0,
  avatarScale = 1,
  className = ''
}: AvatarImageProps) {
  const [aspectRatio, setAspectRatio] = useState<number>(1);

  const x = avatarX ?? 0;
  const y = avatarY ?? 0;
  const scale = avatarScale ?? 1;

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className={`absolute origin-center pointer-events-none select-none max-w-none max-h-none ${className}`}
      style={{
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) translate(${x}%, ${y}%) scale(${scale})`,
        width: aspectRatio > 1 ? 'auto' : '100%',
        height: aspectRatio > 1 ? '100%' : 'auto',
      }}
      onLoad={(e) => {
        const img = e.currentTarget;
        if (img.naturalWidth && img.naturalHeight) {
          setAspectRatio(img.naturalWidth / img.naturalHeight);
        }
      }}
    />
  );
}
