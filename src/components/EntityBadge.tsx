import React, { useEffect, useState } from 'react';
import { Entity } from '../types/omnistats';

interface EntityBadgeProps {
  entity: Entity;
  size?: number;
}

export const EntityBadge: React.FC<EntityBadgeProps> = ({ entity, size = 32 }) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [entity.logoUrl]);

  if (entity.logoUrl && !imgFailed) {
    return (
      <img
        src={entity.logoUrl}
        alt={`Blason ${entity.name}`}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        style={{ width: size, height: size }}
        className="rounded-full object-contain bg-white p-0.5 shrink-0 border border-slate-300 dark:border-slate-700"
      />
    );
  }

  if (entity.type === 'country') {
    return (
      <span
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${entity.c1}, ${entity.c2})`,
          fontSize: Math.round(size * 0.56),
        }}
        className="inline-flex items-center justify-center rounded-full shrink-0 border border-white/25 select-none shadow-xs"
      >
        {entity.flag}
      </span>
    );
  }

  const gradId = `crest_${entity.id}_${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      className="shrink-0"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={entity.c1} />
          <stop offset="100%" stopColor={entity.c2} />
        </linearGradient>
      </defs>
      <path
        d="M18 2L31 7V17C31 25.5 25.2 31.4 18 34C10.8 31.4 5 25.5 5 17V7L18 2Z"
        fill={`url(#${gradId})`}
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.4"
      />
      <text
        x="18"
        y="21.5"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="9.5"
        fontWeight="800"
        fontFamily="Plus Jakarta Sans, sans-serif"
        style={{ paintOrder: 'stroke', stroke: 'rgba(15,23,42,0.75)', strokeWidth: '2px' }}
      >
        {entity.short.slice(0, 3)}
      </text>
    </svg>
  );
};
