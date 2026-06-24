import React, { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'
import { getSlots } from '../utils/parser'

const RES_OPTIONS = [5, 15, 30, 60]

export default function TimelineChart({ data, resolution, onResChange, showDuplicates, onToggleDuplicates }) {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    chartRef.current?.destroy()

    const slots = getSlots(data, resolution)
    const nPoints = slots.length
    const pointRadius = nPoints > 120 ? 0 : 3

    // Build duplicate dataset: records where (barcode, station) appears more than once
    let dupSlots = null
    if (showDuplicates && data.length) {
      const pairCounts = {}
      data.forEach(d => {
        const key = `${d.barcode}|${d.station}`
        pairCounts[key] = (pairCounts[key] || 0) + 1
      })
      const dupData = data.filter(d => pairCounts[`${d.barcode}|${d.station}`] > 1)
      dupSlots = getSlots(dupData, resolution)
    }

    const datasets = [
      {
        label: 'Všetky priechody',
        data: slots.map(s => s[1]),
        borderColor: '#58a6ff',
        backgroundColor: 'rgba(88,166,255,.1)',
        borderWidth: 2, fill: true, tension: 0.3,
        pointRadius, pointHoverRadius: 5,
      },
    ]

    if (dupSlots) {
      datasets.push({
        label: 'Opakované (≥2× na stanici)',
        data: dupSlots.map(s => s[1]),
        borderColor: '#f78166',
        backgroundColor: 'rgba(247,129,102,.07)',
        borderWidth: 2, fill: false, tension: 0.3,
        pointRadius, pointHoverRadius: 5,
        borderDash: [],
      })
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: { labels: slots.map(s => s[0]), datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: {
            display: !!dupSlots,
            labels: { color: '#8b949e', font: { size: 12 }, boxWidth: 14, padding: 16 },
          },
          tooltip: {
            backgroundColor: '#1c2330', titleColor: '#e6edf3',
            bodyColor: '#8b949e', borderColor: '#30363d', borderWidth: 1,
          },
        },
        scales: {
          x: { grid: { color: 'rgba(48,54,61,.5)' }, ticks: { color: '#6e7681', font: { size: 11 }, maxTicksLimit: 24 } },
          y: { grid: { color: 'rgba(48,54,61,.5)' }, ticks: { color: '#6e7681', font: { size: 11 } }, beginAtZero: true },
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [data, resolution, showDuplicates])

  return (
    <>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>📈 Počet priechodov v čase</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text2)' }}>Rozlíšenie:</span>
        {RES_OPTIONS.map(r => (
          <button key={r} className={`pill${resolution === r ? ' active' : ''}`} onClick={() => onResChange(r)}>
            {r < 60 ? `${r} min` : '1 hod'}
          </button>
        ))}

        <label style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7,
          cursor: 'pointer', fontSize: 12, userSelect: 'none',
        }}>
          <input
            type="checkbox"
            checked={showDuplicates}
            onChange={e => onToggleDuplicates(e.target.checked)}
            style={{ accentColor: '#f78166', width: 14, height: 14, cursor: 'pointer' }}
          />
          <span style={{
            color: showDuplicates ? '#f78166' : 'var(--text2)',
            transition: 'color .15s',
          }}>
            Opakované priechody (≥2× na stanici)
          </span>
        </label>
      </div>
      <div style={{ height: 320, position: 'relative' }}><canvas ref={canvasRef} /></div>
    </>
  )
}
