import React, { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'

export default function TopStationsChart({ stStats, onSelect }) {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    chartRef.current?.destroy()

    const top15  = [...stStats].sort((a, b) => b.count - a.count).slice(0, 15)
    const labels = top15.map(s => s.station)
    const data   = top15.map(s => s.count)
    const colors = data.map((_, i) =>
      i === 0 ? '#C8FF00' :
      i < 3   ? 'rgba(200,255,0,0.6)' :
      i < 6   ? 'rgba(200,255,0,0.35)' :
                'rgba(200,255,0,0.18)'
    )

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Priechody', data, backgroundColor: colors, borderRadius: 5 }] },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1A1A24', titleColor: '#F0F0F5', bodyColor: '#6B6B80',
            borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
            callbacks: { footer: () => '👆 Klikni pre detail' },
          },
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6B6B80', font: { size: 11 } } },
          y: { grid: { display: false }, ticks: { color: '#F0F0F5', font: { size: 11 } } },
        },
        onHover: (e, els) => { e.native.target.style.cursor = els.length ? 'pointer' : 'default' },
        onClick: (_, els) => { if (els.length) onSelect(labels[els[0].index]) },
      },
    })

    return () => chartRef.current?.destroy()
  }, [stStats])

  return (
    <>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
        🏆 Top 15 staníc — priechody
      </div>
      <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 14 }}>Klikni na stanicu → detail hodín</div>
      <div style={{ height: 340, position: 'relative' }}><canvas ref={canvasRef} /></div>
    </>
  )
}
