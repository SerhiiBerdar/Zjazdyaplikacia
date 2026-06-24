import { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'
import { getSlots } from '../utils/parser'

export default function StationPopup({ station, type, allData, stStats, onClose }) {
  const chartRef = useRef(null)
  const chartInst = useRef(null)
  const [mode, setMode] = [stStats, () => {}]  // simplified

  const st = stStats.find(s => s.station.toUpperCase() === station.toUpperCase())

  useEffect(() => {
    if (!chartRef.current) return
    if (chartInst.current) { chartInst.current.destroy(); chartInst.current = null }

    const slots = getSlots(allData, 60, station)
    const labels = slots.map(s => s[0])
    const data = slots.map(s => s[1])
    const maxV = Math.max(...data, 1)
    const colors = data.map(v => {
      const r = v/maxV
      return r > .8 ? '#58a6ff' : r > .5 ? '#3fb950' : r > .2 ? '#d2a8ff' : '#374151'
    })

    chartInst.current = new Chart(chartRef.current, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Priechody', data, backgroundColor: colors, borderRadius: 3 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: {
          backgroundColor: '#1c2330', titleColor: '#e6edf3', bodyColor: '#8b949e',
          borderColor: '#30363d', borderWidth: 1,
        }},
        scales: {
          x: { grid: { color: 'rgba(48,54,61,.4)' }, ticks: { color: '#6e7681', font: { size: 9 }, maxTicksLimit: 12 } },
          y: { grid: { color: 'rgba(48,54,61,.4)' }, ticks: { color: '#6e7681', font: { size: 9 } }, beginAtZero: true },
        },
      },
    })
    return () => { if (chartInst.current) { chartInst.current.destroy(); chartInst.current = null } }
  }, [station, allData])

  const cnt = st?.count ?? 0
  const klt = st?.unique ?? 0
  const peak = st ? `${st.peak}:00` : '—'

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, width: 380,
      background: 'var(--panel)', border: '1px solid var(--accent)', borderRadius: 14,
      zIndex: 300, boxShadow: '0 8px 40px rgba(0,0,0,.6)',
      animation: 'slideUp .2s ease',
    }}>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 700, flex: 1 }}>{station}</div>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
          background: type==='D' ? 'rgba(220,50,50,.2)' : 'rgba(60,150,80,.2)',
          color: type==='D' ? '#f87171' : '#4ade80',
          border: `1px solid ${type==='D' ? 'rgba(220,50,50,.4)' : 'rgba(60,150,80,.4)'}`,
        }}>{type === 'D' ? 'Divertor' : 'Stanica'}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer', padding: '0 4px' }}>✕</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
        {[['Priechodov', cnt.toLocaleString('sk')], ['Unik. KLT', klt.toLocaleString('sk')], ['Vrchol', peak]].map(([lbl, val]) => (
          <div key={lbl} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{val}</div>
            <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{lbl}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 16px 16px', height: 180, position: 'relative' }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  )
}
