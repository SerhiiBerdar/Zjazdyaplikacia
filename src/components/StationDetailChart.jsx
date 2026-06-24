import React, { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'
import { getSlots } from '../utils/parser'

export default function StationDetailChart({ allData, stStats, selected, onSelect, mode, onModeChange }) {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)

  const sorted = [...stStats].sort((a,b)=>b.count-a.count)
  const currentStation = selected || (sorted[0]?.station ?? '')

  useEffect(() => {
    if (!canvasRef.current || !currentStation) return
    chartRef.current?.destroy()

    const st = stStats.find(s=>s.station===currentStation)
    const slots = getSlots(allData, mode==='hour'?60:15, currentStation)
    const labels = slots.map(s=>s[0])
    const data   = slots.map(s=>s[1])
    const maxV   = Math.max(...data,1)
    const colors = data.map(v=>{const r=v/maxV;return r>.8?'#58a6ff':r>.5?'#3fb950':r>.25?'#d2a8ff':'#374151'})

    chartRef.current = new Chart(canvasRef.current, {
      type:'bar',
      data:{labels,datasets:[{label:'Priechody',data,backgroundColor:colors,borderRadius:4}]},
      options:{
        responsive:true,maintainAspectRatio:false,
        plugins:{legend:{display:false},
          title:{display:true,text:`${currentStation} — ${st?.count?.toLocaleString('sk')??0} priechodov · vrchol ${st?.peak}:00`,color:'#8b949e',font:{size:11,weight:'500'},padding:{bottom:6}},
          tooltip:{backgroundColor:'#1c2330',titleColor:'#e6edf3',bodyColor:'#8b949e',borderColor:'#30363d',borderWidth:1}},
        scales:{
          x:{grid:{color:'rgba(48,54,61,.5)'},ticks:{color:'#6e7681',font:{size:11},maxTicksLimit:24}},
          y:{grid:{color:'rgba(48,54,61,.5)'},ticks:{color:'#6e7681',font:{size:11}},beginAtZero:true}
        }
      }
    })
    return () => chartRef.current?.destroy()
  }, [allData, stStats, currentStation, mode])

  return (
    <>
      <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>🕐 Vyťaženosť stanice podľa hodín</div>
      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:10,flexWrap:'wrap'}}>
        <select value={currentStation} onChange={e=>onSelect(e.target.value)} style={{flex:1,minWidth:140}}>
          {sorted.map(s=><option key={s.station} value={s.station}>{s.station} — {s.count.toLocaleString('sk')}</option>)}
        </select>
        {['hour','15min'].map(m=>(
          <button key={m} className={`pill${mode===m?' active':''}`} onClick={()=>onModeChange(m)}>
            {m==='hour'?'Hodiny':'15 min'}
          </button>
        ))}
      </div>
      <div style={{height:300,position:'relative'}}><canvas ref={canvasRef}/></div>
    </>
  )
}
