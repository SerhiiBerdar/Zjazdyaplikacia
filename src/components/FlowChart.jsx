import React, { useState, useMemo } from 'react'

export default function FlowChart({ flowData, stations }) {
  const [fromF, setFromF] = useState('')
  const [toF,   setToF]   = useState('')
  const [dest,  setDest]  = useState('')
  const [topN,  setTopN]  = useState(20)

  const pairs = useMemo(() => {
    let result = Object.values(flowData.pairs || {})
      .map(p => ({ ...p, arrived: dest ? [...p.barcodes].filter(bc => flowData.kltStations[bc]?.has(dest)).length : null }))
      .filter(p => (!fromF || p.from === fromF) && (!toF || p.to === toF))
      .sort((a, b) => b.count - a.count)
    if (topN > 0) result = result.slice(0, topN)
    return result
  }, [flowData, fromF, toF, dest, topN])

  const maxCount = pairs[0]?.count || 1
  const sel = { width: '100%' }

  return (
    <>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
        🔀 Tok KLT medzi stanicami
      </div>
      <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 14 }}>
        Koľko KLT prešlo priamo zo stanice A na stanicu B
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {[
          ['Zdrojová (Od)', fromF, setFromF],
          ['Ďalšia (Do)',   toF,   setToF],
          ['✅ Dorazilo na', dest,  setDest],
        ].map(([label, val, set]) => (
          <div key={label} style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 5 }}>
              {label}
            </div>
            <select style={sel} value={val} onChange={e => set(e.target.value)}>
              <option value="">{label.includes('Dorazilo') ? '— nezobrazovať —' : '— všetky —'}</option>
              {stations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 5 }}>
            Zobraziť top
          </div>
          <select style={sel} value={topN} onChange={e => setTopN(+e.target.value)}>
            <option value={20}>Top 20</option>
            <option value={50}>Top 50</option>
            <option value={0}>Všetky</option>
          </select>
        </div>
      </div>

      {!pairs.length ? (
        <div style={{ textAlign: 'center', padding: 30, color: 'var(--text3)', fontSize: 12 }}>
          Žiadne toky pre zvolené kritériá
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Stanica Od → Do', '', 'Počet KLT', dest && '✅ Dorazilo', dest && '%'].filter(Boolean).map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '9px 10px', fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pairs.map((p, i) => {
                const ratio = p.count / maxCount
                const pct   = p.arrived != null ? Math.round(p.arrived / p.count * 100) : null
                const barColor = ratio > .8 ? '#C8FF00' : ratio > .5 ? 'rgba(200,255,0,0.6)' : ratio > .3 ? 'rgba(200,255,0,0.35)' : 'rgba(200,255,0,0.15)'
                return (
                  <tr
                    key={i}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '9px 10px', fontWeight: 500 }}>{p.from} → {p.to}</td>
                    <td style={{ padding: '4px 10px', width: 260 }}>
                      <div style={{ height: 5, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${ratio * 100}%`, background: barColor, borderRadius: 3, transition: 'width 0.3s' }} />
                      </div>
                    </td>
                    <td style={{ padding: '9px 10px', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 14 }}>
                      {p.count.toLocaleString('sk')}
                    </td>
                    {dest && (
                      <td style={{ padding: '9px 10px', fontWeight: 600, color: pct > 50 ? '#C8FF00' : pct > 25 ? '#22D3EE' : '#FF4D6D' }}>
                        {p.arrived?.toLocaleString('sk')}
                      </td>
                    )}
                    {dest && <td style={{ padding: '9px 10px', color: 'var(--text2)' }}>{pct}%</td>}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
