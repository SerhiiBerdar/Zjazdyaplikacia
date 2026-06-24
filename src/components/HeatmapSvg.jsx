import React, { useMemo } from 'react'

function getColor(v, maxV) {
  if (!v) return '#0D0D14'
  const r = v / maxV
  if (r < .15) return '#162000'
  if (r < .35) return '#2A3D00'
  if (r < .55) return '#4A6B00'
  if (r < .75) return '#78A800'
  if (r < .90) return '#A8D600'
  return '#C8FF00'
}

const LEGEND_COLORS = ['#0D0D14', '#162000', '#2A3D00', '#4A6B00', '#78A800', '#A8D600', '#C8FF00']

export default function HeatmapSvg({ stStats, allData, topN, onTopNChange }) {
  const { hours, stations, maxV } = useMemo(() => {
    const usedH = [...new Set(allData.map(d => d.hour))].sort((a, b) => a - b)
    let splitAfter = -1, maxGap = 0
    for (let i = 0; i < usedH.length - 1; i++) {
      const g = usedH[i + 1] - usedH[i]
      if (g > maxGap) { maxGap = g; splitAfter = i }
    }
    const hours = (maxGap > 3 && splitAfter >= 0)
      ? [...usedH.slice(splitAfter + 1), ...usedH.slice(0, splitAfter + 1)]
      : usedH

    const sorted   = [...stStats].sort((a, b) => b.count - a.count)
    const stations = topN > 0 ? sorted.slice(0, topN) : sorted

    let maxV = 0
    stations.forEach(s => hours.forEach(h => { const v = s.hourBuckets[h] || 0; if (v > maxV) maxV = v }))
    return { hours, stations, maxV }
  }, [allData, stStats, topN])

  const cW = 52, cH = 28, labW = 130, headH = 30, pad = 6
  const svgW = labW + hours.length * cW + pad * 2
  const svgH = headH + stations.length * cH + pad * 2 + 24

  return (
    <>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
        🗺️ Heatmapa — vyťaženosť podľa hodín
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: 'var(--text2)' }}>Zobraziť top:</span>
        {[25, 40, 0].map(n => (
          <button key={n} className={`pill${topN === n ? ' active' : ''}`} onClick={() => onTopNChange(n)}>
            {n === 0 ? 'Všetky' : n}
          </button>
        ))}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <svg width={svgW} height={svgH} xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: 'DM Sans,Segoe UI,sans-serif' }}>

          {/* Legend */}
          {LEGEND_COLORS.map((c, i) => (
            <rect key={i} x={labW + pad + 42 + i * 14} y={svgH - 14} width={12} height={10} rx={2} fill={c} />
          ))}
          <text x={labW + pad} y={svgH - 4} fill="#3D3D52" fontSize={9}>Menej</text>
          <text x={labW + pad + 42 + 7 * 14 + 3} y={svgH - 4} fill="#3D3D52" fontSize={9}>Viac</text>

          {/* Hour headers */}
          {hours.map((h, i) => (
            <text key={h} x={labW + i * cW + cW / 2 + pad} y={headH - 6 + pad}
              textAnchor="middle" fill="#6B6B80" fontSize={10}>
              {String(h).padStart(2, '0')}:00
            </text>
          ))}

          {/* Rows */}
          {stations.map((st, ri) => {
            const y   = headH + ri * cH + pad
            const lbl = st.station.length > 17 ? st.station.slice(0, 16) + '…' : st.station
            return (
              <g key={st.station}>
                <text x={pad + labW - 6} y={y + cH / 2 + 4} textAnchor="end" fill="#F0F0F5" fontSize={11}>
                  {lbl}
                </text>
                {hours.map((hour, ci) => {
                  const val  = st.hourBuckets[hour] || 0
                  const cx   = labW + ci * cW + pad
                  const disp = val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val > 0 ? String(val) : ''
                  const ratio = val / maxV
                  const tc   = ratio > .45 ? '#0A0A0F' : '#6B6B80'
                  return (
                    <g key={hour}>
                      <rect x={cx + 1} y={y + 1} width={cW - 2} height={cH - 2} rx={3} fill={getColor(val, maxV)} />
                      {disp && (
                        <text x={cx + cW / 2} y={y + cH / 2 + 4} textAnchor="middle" fill={tc} fontSize={10}>
                          {disp}
                        </text>
                      )}
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>
      </div>
    </>
  )
}
