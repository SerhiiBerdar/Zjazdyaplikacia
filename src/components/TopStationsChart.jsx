import React, { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'

export default function TopStationsChart({ stStats, onSelect }) {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    chartRef.current?.destroy()
    const top15 = [...stStats].sort((a,b)=>b.count-a.count).slice(0,15)
    const labels = top15.map(s=>s.station)
    const data   = top15.map(s=>s.count)
    const colors = data.map((_,i)=>i===0?'#58a6ff':i<3?'#3fb950':'#8b949e')

    chartRef.current = new Chart(canvasRef.current, {
      type:'bar',
      data:{labels,datasets:[{label:'Priechody',data,backgroundColor:colors,borderRadius:4}]},
      options:{
        indexAxis:'y', responsive:true, maintainAspectRatio:false,
        plugins:{legend:{display:false},tooltip:{backgroundColor:'#1c2330',titleColor:'#e6edf3',bodyColor:'#8b949e',borderColor:'#30363d',borderWidth:1,callbacks:{footer:()=>'👆 Klikni pre detail'}}},
        scales:{
          x:{grid:{color:'rgba(48,54,61,.5)'},ticks:{color:'#6e7681',font:{size:11}}},
          y:{grid:{display:false},ticks:{color:'#e6edf3',font:{size:11}}}
        },
        onHover:(e,els)=>{e.native.target.style.cursor=els.length?'pointer':'default'},
        onClick:(_,els)=>{ if(els.length) onSelect(labels[els[0].index]) }
      }
    })
    return () => chartRef.current?.destroy()
  }, [stStats])

  return (
    <>
      <div style={{fontSize:13,fontWeight:600,marginBottom:3}}>🏆 Top 15 staníc — počet priechodov</div>
      <div style={{fontSize:11,color:'var(--text3)',marginBottom:12}}>Klikni na stanicu → detail hodín</div>
      <div style={{height:340,position:'relative'}}><canvas ref={canvasRef}/></div>
    </>
  )
}
