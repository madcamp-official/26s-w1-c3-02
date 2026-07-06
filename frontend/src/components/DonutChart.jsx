import React from 'react';

// 분포 도넛 차트 — 세그먼트 사이 2px 간격, 둥근 끝, 값은 범례에 항상 직접 표기(호버 없이도 읽힘).
// segments: [{ key, label, value, color }], total: 분모.
export default function DonutChart({ segments, total }) {
  const radius = 54;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;
  const gapPx = 2;
  const usable = circumference - segments.length * gapPx;
  let cumulative = 0;

  return (
    <svg viewBox="0 0 140 140" className="mx-auto h-[150px] w-[150px]">
      <circle cx="70" cy="70" r={radius} fill="none" stroke="#f3f5f8" strokeWidth={strokeWidth} />
      <g transform="translate(70,70) rotate(-90)">
        {segments.map((seg) => {
          const fraction = total > 0 ? seg.value / total : 0;
          const dash = fraction * usable;
          const offset = -cumulative;
          cumulative += dash + gapPx;
          if (dash <= 0) return null;
          const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return (
            <circle
              key={seg.key}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={offset}
            >
              <title>{`${seg.label}: ${seg.value}개 (${pct}%)`}</title>
            </circle>
          );
        })}
      </g>
      <text x="70" y="66" textAnchor="middle" className="fill-text-subtle" style={{ fontSize: 11, fontWeight: 600 }}>
        총
      </text>
      <text x="70" y="87" textAnchor="middle" className="fill-text" style={{ fontSize: 20, fontWeight: 800 }}>
        {total}개
      </text>
    </svg>
  );
}
