import React from 'react'

export default function FilterBar({ filters, onChange, stations, hours, total, allTotal }) {
  const hasFilter = filters.barcode || filters.station || filters.hour !== ''
  const pct = allTotal ? ((total / allTotal) * 100).toFixed(1) : 0

  const activeStyle = {
    borderColor: 'rgba(200,255,0,0.5)',
    background: 'rgba(200,255,0,0.06)',
    boxShadow: '0 0 0 3px rgba(200,255,0,0.08)',
  }

  return (
    <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>

      {/* Barcode */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 160 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          🔍 Čiarový kód (KLT)
        </label>
        <input
          type="text"
          value={filters.barcode}
          placeholder="napr. 80145688"
          onChange={e => onChange({ ...filters, barcode: e.target.value })}
          style={filters.barcode ? activeStyle : {}}
        />
      </div>

      {/* Station */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 160 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          🏭 Stanica
        </label>
        <select
          value={filters.station}
          onChange={e => onChange({ ...filters, station: e.target.value })}
          style={filters.station ? activeStyle : {}}
        >
          <option value="">— všetky stanice —</option>
          {stations.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Hour */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 140 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          🕐 Hodina prejazdu
        </label>
        <select
          value={filters.hour}
          onChange={e => onChange({ ...filters, hour: e.target.value })}
          style={filters.hour !== '' ? activeStyle : {}}
        >
          <option value="">— všetky hodiny —</option>
          {hours.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
        </select>
      </div>

      {/* Reset */}
      <button
        className="btn-ghost"
        style={{ alignSelf: 'flex-end', padding: '8px 16px', fontSize: 11 }}
        onClick={() => onChange({ barcode: '', station: '', hour: '' })}
      >
        ↺ Reset
      </button>

      {/* Active filter indicator */}
      {hasFilter && (
        <div style={{
          alignSelf: 'flex-end', paddingBottom: 9,
          fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
          color: 'var(--accent)',
          textShadow: '0 0 12px rgba(200,255,0,0.4)',
        }}>
          {total.toLocaleString('sk')} / {allTotal.toLocaleString('sk')} ({pct}%)
        </div>
      )}
    </div>
  )
}
