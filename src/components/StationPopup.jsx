import { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'
import { getSlots } from '../utils/parser'

export default function StationPopup({ station, type, allData, stStats, onClose }) {
  const chartRef  = useRef(null)
  const chartInst = useRef(null)

  const st = stStats.find(s => s.station.toUpperCase() === station.toUpperCase())

  useEffect(() => {
    if (!chartRef.current) return
    chartInst.current?.destroy()

    const slots  = getSlots(allData, 60, station)
    const labels = slots.map(s => s[0])
    const data   = slots.map(s => s[1])
    const maxV   = Math.max(...data, 1)
    const colors = data.map(v => {
      const r = v / maxV
      return r > .8 ? '#C8FF00' : r > .5 ? '#22D3EE' : r > .2 ? '#A78BFA' : '#1A1A2E'
    })

    chartInst.current = new Chart(chartRef.current, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Priechody', data, backgroundColor: colors, borderRadius: 4 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1A1A24', titleColor: '#F0F0F5', bodyColor: '#6B6B80',
            borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
          },
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6B6B80', font: { size: 9 }, maxTicksLimit: 12 } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6B6B80', font: { size: 9 } }, beginAtZero: true },
        },
      },
    })

    return () => { chartInst.current?.destroy(); chartInst.current = null }
  }, [station, allData])

  const cnt  = st?.count ?? 0
  const klt  = st?.unique ?? 0
  const peak = st ? `${st.peak}:00` : '—'

  const typeBadge = type === 'D'
    ? { bg: 'rgba(255,77,109,0.15)', color: '#FF4D6D', border: 'rgba(255,77,109,0.35)', label: 'Divertor' }
    : { bg: 'rgba(200,255,0,0.12)',  color: '#C8FF00', border: 'rgba(200,255,0,0.3)',   label: 'Stanica'  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, width: 390,
      background: 'var(--surface)',
      border: '1px solid rgba(200,255,0,0.3)',
      borderRadius: 16, zIndex: 300,
      boxShadow: '0 16px 60px rgba(0,0,0,0.7), 0 0 30px rgba(200,255,0,0.08)',
      animation: 'slideUp .22s var(--ease)',
    }}>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* Header */}
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, flex: 1, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {station}
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
          background: typeBadge.bg, color: typeBadge.color, border: `1px solid ${typeBadge.border}`,
          letterSpacing: '0.06em',
        }}>
          {typeBadge.label}
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}>✕</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '12px 16px', borderBottom: '1px solid var(--border)', gap: 8 }}>
        {[['Priechodov', cnt.toLocaleString('sk'), 0], ['Unik. KLT', klt.toLocaleString('sk'), 1], ['Vrchol', peak, 2]].map(([lbl, val, ai]) => {
          const c = ['#C8FF00', '#22D3EE', '#A78BFA'][ai]
          return (
            <div key={lbl} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: c, textShadow: `0 0 14px ${c}66` }}>
                {val}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 3 }}>
                {lbl}
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart */}
      <div style={{ padding: '12px 16px 16px', height: 190, position: 'relative' }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  )
}
