import React, { useEffect, useRef, useState } from 'react'
import { Chart } from 'chart.js/auto'
import { getSlots } from '../utils/parser'

const RES_OPTIONS = [5,15,30,60]

export default function TimelineChart({ data, resolution, onResChange }) {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)
  const [showDoubles, setShowDoubles] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return
    chartRef.current?.destroy()
    const slots = getSlots(data, resolution)
    const datasets = [{ label:'Priechody', data:slots.map(s=>s.value),
      borderColor:'#58a6ff', backgroundColor:'rgba(88,166,255,.1)',
      borderWidth:2, fill:true, tension:0.3,
      pointRadius:slots.length>120?0:3, pointHoverRadius:5 }]
    if (showDoubles) datasets.push({ label:'Dvojité prejazdy', data:slots.map(s=>s.doubles),
      borderColor:'#f85149', backgroundColor:'rgba(248,81,73,.1)',
      borderWidth:2, fill:true, tension:0.3,
      pointRadius:slots.length>120?0:3, pointHoverRadius:5 })
    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: slots.map(s=>s.label),
        datasets
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{legend:{display:showDoubles,labels:{color:'#8b949e',font:{size:11},boxWidth:12}},tooltip:{backgroundColor:'#1c2330',titleColor:'#e6edf3',bodyColor:'#8b949e',borderColor:'#30363d',borderWidth:1}},
        scales:{
          x:{grid:{color:'rgba(48,54,61,.5)'},ticks:{color:'#6e7681',font:{size:11},maxTicksLimit:24}},
          y:{grid:{color:'rgba(48,54,61,.5)'},ticks:{color:'#6e7681',font:{size:11}},beginAtZero:true}
        }
      }
    })
    return () => chartRef.current?.destroy()
  }, [data, resolution, showDoubles])

  return (
    <>
      <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>📈 Počet priechodov v čase</div>
      <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap',alignItems:'center'}}>
        <span style={{fontSize:11,color:'var(--text2)'}}>Rozlíšenie:</span>
        {RES_OPTIONS.map(r => (
          <button key={r} className={`pill${resolution===r?' active':''}`} onClick={()=>onResChange(r)}>
            {r<60?`${r} min`:'1 hod'}
          </button>
        ))}
        <label style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:'var(--text2)',cursor:'pointer',marginLeft:'auto'}}>
          <input type="checkbox" checked={showDoubles} onChange={e=>setShowDoubles(e.target.checked)} style={{cursor:'pointer'}}/>
          Dvojité prejazdy
        </label>
      </div>
      <div style={{height:320,position:'relative'}}><canvas ref={canvasRef}/></div>
    </>
  )
}
