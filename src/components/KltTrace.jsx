export default function KltTrace({ allData, search, onSearchChange }) {
  const rows = search.length >= 3
    ? allData.filter(d => d.barcode.includes(search)).sort((a,b) => a.datetime - b.datetime)
    : []
  const barcodes = [...new Set(rows.map(d => d.barcode))].slice(0, 5)

  const fmtTime = dt => dt.toLocaleTimeString('sk', { hour:'2-digit', minute:'2-digit', second:'2-digit' })
  const fmtDate = dt => dt.toLocaleDateString('sk', { day:'2-digit', month:'2-digit' })

  return (
    <>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>🚚 Trasa KLT prepravky</div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <input type="text" value={search} onChange={e => onSearchChange(e.target.value)}
          placeholder="Zadaj čiarový kód..." style={{ width: 220, fontFamily: 'Consolas,monospace' }} />
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>Chronologický pohyb KLT cez stanice</span>
      </div>
      {search.length < 3
        ? <div style={{ textAlign: 'center', padding: 30, color: 'var(--text3)', fontSize: 12 }}>Zadajte aspoň 3 znaky čiarového kódu</div>
        : !rows.length
          ? <div style={{ textAlign: 'center', padding: 30, color: 'var(--text3)', fontSize: 12 }}>Žiadne záznamy pre „{search}"</div>
          : barcodes.map(bc => {
              const steps = rows.filter(d => d.barcode === bc)
              return (
                <div key={bc} style={{ marginBottom: barcodes.length > 1 ? 20 : 0 }}>
                  {barcodes.length > 1 && <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', marginBottom: 8, fontFamily: 'monospace' }}>{bc} — {steps.length} staníc</div>}
                  {steps.map((step, i) => {
                    const prev = steps[i-1]
                    let delta = ''
                    if (prev) {
                      const ds = Math.abs(Math.round((step.datetime - prev.datetime)/1000))
                      delta = ds < 60 ? `+${ds}s` : ds < 3600 ? `+${Math.floor(ds/60)}min ${ds%60}s` : `+${Math.floor(ds/3600)}h ${Math.floor((ds%3600)/60)}min`
                    }
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 20px 1fr', gap: '0 12px', alignItems: 'start' }}>
                        <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace', textAlign: 'right', paddingTop: 3 }}>
                          {fmtDate(step.datetime)}<br/>{fmtTime(step.datetime)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: 12, height: 12, borderRadius: '50%', marginTop: 3, flexShrink: 0,
                            background: i === 0 ? 'var(--accent2)' : i === steps.length-1 ? 'var(--accent3)' : 'var(--accent)',
                            border: '2px solid var(--bg)' }} />
                          {i < steps.length-1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', minHeight: 20 }} />}
                        </div>
                        <div style={{ padding: '2px 0 16px' }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{step.station}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                            {delta ? delta + ' od predchádzajúcej' : <span style={{ color: 'var(--accent2)' }}>Štart trasy</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })
      }
      {barcodes.length > 5 && <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', padding: 12 }}>... a ďalšie {[...new Set(rows.map(d => d.barcode))].length - 5} KLT. Spresni hľadanie.</div>}
    </>
  )
}
