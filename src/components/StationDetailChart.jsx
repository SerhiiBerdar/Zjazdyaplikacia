import React, { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'
import { getSlots } from '../utils/parser'

export default function StationDetailChart({ allData, stStats, selected, onSelect, mode, onModeChange }) {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)

  const sorted         = [...stStats].sort((a, b) => b.count - a.count)
  const currentStation = selected || (sorted[0]?.station ?? '')

  useEffect(() => {
    if (!canvasRef.current || !currentStation) return
    chartRef.current?.destroy()

    const st     = stStats.find(s => s.station === currentStation)
    const slots  = getSlots(allData, mode === 'hour' ? 60 : 15, currentStation)
    const labels = slots.map(s => s[0])
    const data   = slots.map(s => s[1])
    const maxV   = Math.max(...data, 1)
    const colors = data.map(v => {
      const r = v / maxV
      return r > .8 ? '#C8FF00' : r > .5 ? '#22D3EE' : r > .25 ? '#A78BFA' : '#1E1E2E'
    })

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Priechody', data, backgroundColor: colors, borderRadius: 5 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: `${currentStation} — ${st?.count?.toLocaleString('sk') ?? 0} priechodov · vrchol ${st?.peak}:00`,
            color: '#6B6B80', font: { size: 11, weight: '500', family: 'DM Sans' }, padding: { bottom: 8 },
          },
          tooltip: {
            backgroundColor: '#1A1A24', titleColor: '#F0F0F5', bodyColor: '#6B6B80',
            borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
          },
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6B6B80', font: { size: 11 }, maxTicksLimit: 24 } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6B6B80', font: { size: 11 } }, beginAtZero: true },
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [allData, stStats, currentStation, mode])

  return (
    <>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
        🕐 Vyťaženosť stanice
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <select value={currentStation} onChange={e => onSelect(e.target.value)} style={{ flex: 1, minWidth: 140 }}>
          {sorted.map(s => <option key={s.station} value={s.station}>{s.station} — {s.count.toLocaleString('sk')}</option>)}
        </select>
        {['hour', '15min'].map(m => (
          <button key={m} className={`pill${mode === m ? ' active' : ''}`} onClick={() => onModeChange(m)}>
            {m === 'hour' ? 'Hodiny' : '15 min'}
          </button>
        ))}
      </div>
      <div style={{ height: 300, position: 'relative' }}><canvas ref={canvasRef} /></div>
    </>
  )
}
