import React from 'react'

export default function FilterBar({ filters, onChange, stations, hours, total, allTotal }) {
  const hasFilter = filters.barcode || filters.station || filters.hour !== ''
  const pct = allTotal ? ((total/allTotal)*100).toFixed(1) : 0

  return (
    <div className="card" style={{padding:'16px 20px',marginBottom:20,display:'flex',gap:14,flexWrap:'wrap',alignItems:'flex-end'}}>
      {[
        { label:'🔍 Čiarový kód (KLT)', key:'barcode', type:'text', placeholder:'napr. 80145688' },
      ].map(f => (
        <div key={f.key} style={{display:'flex',flexDirection:'column',gap:5,flex:1,minWidth:160}}>
          <label style={{fontSize:10,fontWeight:600,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'.06em'}}>{f.label}</label>
          <input type="text" value={filters[f.key]} placeholder={f.placeholder}
            onChange={e=>onChange({...filters,[f.key]:e.target.value})}
            style={{borderColor:filters[f.key]?'var(--accent)':'',background:filters[f.key]?'rgba(88,166,255,.06)':''}}/>
        </div>
      ))}

      <div style={{display:'flex',flexDirection:'column',gap:5,flex:1,minWidth:160}}>
        <label style={{fontSize:10,fontWeight:600,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'.06em'}}>🏭 Stanica</label>
        <select value={filters.station} onChange={e=>onChange({...filters,station:e.target.value})}
          style={{borderColor:filters.station?'var(--accent)':'',background:filters.station?'rgba(88,166,255,.06)':''}}>
          <option value="">— všetky stanice —</option>
          {stations.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:5,flex:1,minWidth:140}}>
        <label style={{fontSize:10,fontWeight:600,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'.06em'}}>🕐 Hodina prejazdu</label>
        <select value={filters.hour} onChange={e=>onChange({...filters,hour:e.target.value})}
          style={{borderColor:filters.hour!==''?'var(--accent)':'',background:filters.hour!==''?'rgba(88,166,255,.06)':''}}>
          <option value="">— všetky hodiny —</option>
          {hours.map(h => <option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}
        </select>
      </div>

      <button className="btn-ghost" style={{alignSelf:'flex-end',padding:'7px 14px',fontSize:11}}
        onClick={()=>onChange({barcode:'',station:'',hour:''})}>↺ Reset</button>

      {hasFilter && (
        <div style={{fontSize:11,color:'var(--accent2)',alignSelf:'flex-end',paddingBottom:8,whiteSpace:'nowrap'}}>
          {total.toLocaleString('sk')} / {allTotal.toLocaleString('sk')} ({pct}%)
        </div>
      )}
    </div>
  )
}
