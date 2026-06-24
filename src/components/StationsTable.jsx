import { useState } from 'react'
export default function StationsTable({ stStats, total, onFilterStation }) {
  const [search, setSearch] = useState('')
  const [sortF, setSortF] = useState('count')
  const [sortD, setSortD] = useState(-1)

  const maxC = Math.max(...stStats.map(s => s.count), 1)
  const rows = stStats
    .filter(s => !search || s.station.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => {
      const av = a[sortF], bv = b[sortF]
      if (av instanceof Date) return sortD * (av - bv)
      if (typeof av === 'number') return sortD * (av - bv)
      return sortD * String(av).localeCompare(String(bv))
    })

  const fmt = dt => dt.toLocaleString('sk', { hour:'2-digit', minute:'2-digit', second:'2-digit', day:'2-digit', month:'2-digit' })
  const th = (label, field) => (
    <th onClick={() => { setSortF(field); setSortD(sortF === field ? sortD*-1 : -1) }}
      style={{ textAlign:'left', padding:'9px 14px', fontSize:10, fontWeight:600, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'.06em', borderBottom:'1px solid var(--border)', cursor:'pointer', whiteSpace:'nowrap' }}>
      {label} {sortF===field ? (sortD===-1?'↓':'↑') : ''}
    </th>
  )

  return (
    <>
      <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>📊 Prehľad staníc <span style={{ fontWeight: 400, color: 'var(--text3)', fontSize: 11 }}>({rows.length} staníc)</span></div>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Hľadať stanicu..." style={{ width: 200 }} />
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={{ padding:'9px 14px', fontSize:10, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'.06em', borderBottom:'1px solid var(--border)', textAlign:'left' }}>#</th>
            {th('Stanica','station')} {th('Priechody','count')} {th('Podiel','count')}
            {th('Unik. KLT','unique')} {th('Vrchol','peak')}
            {th('Prvý priechod','first')} {th('Posledný','last')}
            <th style={{ padding:'9px 14px', fontSize:10, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'.06em', borderBottom:'1px solid var(--border)', textAlign:'left' }}>Vyťaženosť</th>
          </tr></thead>
          <tbody>
            {rows.map((s, i) => (
              <tr key={s.station} style={{ borderBottom: '1px solid rgba(48,54,61,.4)' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.02)'}
                onMouseLeave={e => e.currentTarget.style.background=''}>
                <td style={{ padding:'9px 14px', fontSize:12, color:'var(--text3)' }}>{i+1}</td>
                <td style={{ padding:'9px 14px', fontSize:12 }}>
                  <span onClick={() => onFilterStation(s.station)} style={{
                    display:'inline-block', background:'rgba(88,166,255,.1)', border:'1px solid rgba(88,166,255,.25)',
                    color:'var(--accent)', fontSize:10, fontWeight:600, padding:'2px 6px', borderRadius:4, cursor:'pointer',
                  }}>{s.station}</span>
                </td>
                <td style={{ padding:'9px 14px', fontSize:12 }}><strong>{s.count.toLocaleString('sk')}</strong></td>
                <td style={{ padding:'9px 14px', fontSize:12 }}>{((s.count/total)*100).toFixed(2)}%</td>
                <td style={{ padding:'9px 14px', fontSize:12 }}>{s.unique.toLocaleString('sk')}</td>
                <td style={{ padding:'9px 14px', fontSize:12, color:'var(--accent4)' }}>{s.peak}:00 <span style={{ color:'var(--text3)', fontSize:10 }}>({s.peakCount.toLocaleString('sk')}x)</span></td>
                <td style={{ padding:'9px 14px', fontSize:11, color:'var(--text2)' }}>{fmt(s.first)}</td>
                <td style={{ padding:'9px 14px', fontSize:11, color:'var(--text2)' }}>{fmt(s.last)}</td>
                <td style={{ padding:'9px 14px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ flex:1, height:5, background:'var(--bg)', borderRadius:3, overflow:'hidden', minWidth:50 }}>
                      <div style={{ height:'100%', width:`${(s.count/maxC)*100}%`, background:'var(--accent)', borderRadius:3 }}/>
                    </div>
                    <span style={{ fontSize:10, color:'var(--text3)', minWidth:32 }}>{((s.count/maxC)*100).toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
