import React, { useMemo } from 'react'

function getColor(v, maxV) {
  if (!v) return '#161b22'
  const r = v/maxV
  if (r<.15) return '#0a2d4a'
  if (r<.35) return '#0550ae'
  if (r<.55) return '#0969da'
  if (r<.75) return '#388bfd'
  if (r<.9)  return '#58a6ff'
  return '#79c0ff'
}

export default function HeatmapSvg({ stStats, allData, topN, onTopNChange }) {
  const { hours, stations, maxV } = useMemo(() => {
    const usedH = [...new Set(allData.map(d=>d.hour))].sort((a,b)=>a-b)
    let splitAfter=-1, maxGap=0
    for(let i=0;i<usedH.length-1;i++){const g=usedH[i+1]-usedH[i];if(g>maxGap){maxGap=g;splitAfter=i}}
    const hours = (maxGap>3&&splitAfter>=0)
      ? [...usedH.slice(splitAfter+1),...usedH.slice(0,splitAfter+1)]
      : usedH

    const sorted = [...stStats].sort((a,b)=>b.count-a.count)
    const stations = topN>0 ? sorted.slice(0,topN) : sorted

    let maxV=0
    stations.forEach(s=>hours.forEach(h=>{const v=s.hourBuckets[h]||0;if(v>maxV)maxV=v}))
    return { hours, stations, maxV }
  }, [allData, stStats, topN])

  const cW=52,cH=28,labW=130,headH=30,pad=6
  const svgW = labW+hours.length*cW+pad*2
  const svgH = headH+stations.length*cH+pad*2+20

  return (
    <>
      <div style={{fontSize:13,fontWeight:600,marginBottom:3}}>🗺️ Heatmapa — vyťaženosť staníc podľa hodín</div>
      <div style={{display:'flex',gap:6,alignItems:'center',marginBottom:10,flexWrap:'wrap'}}>
        <span style={{fontSize:11,color:'var(--text2)'}}>Zobraziť top:</span>
        {[25,40,0].map(n=>(
          <button key={n} className={`pill${topN===n?' active':''}`} onClick={()=>onTopNChange(n)}>
            {n===0?'Všetky':n}
          </button>
        ))}
      </div>
      <div style={{overflowX:'auto'}}>
        <svg width={svgW} height={svgH} xmlns="http://www.w3.org/2000/svg" style={{fontFamily:'Segoe UI,sans-serif'}}>
          {/* Legend */}
          {['#161b22','#0a2d4a','#0550ae','#0969da','#388bfd','#58a6ff','#79c0ff'].map((c,i)=>(
            <rect key={i} x={labW+pad+38+i*14} y={svgH-12} width={12} height={10} rx={2} fill={c}/>
          ))}
          <text x={labW+pad} y={svgH-2} fill="#6e7681" fontSize={9}>Menej</text>
          <text x={labW+pad+38+7*14+3} y={svgH-2} fill="#6e7681" fontSize={9}>Viac</text>

          {/* Hour headers */}
          {hours.map((h,i)=>(
            <text key={h} x={labW+i*cW+cW/2+pad} y={headH-6+pad} textAnchor="middle" fill="#6e7681" fontSize={10}>
              {String(h).padStart(2,'0')}:00
            </text>
          ))}

          {/* Rows */}
          {stations.map((st,ri)=>{
            const y=headH+ri*cH+pad
            const lbl=st.station.length>17?st.station.slice(0,16)+'…':st.station
            return (
              <g key={st.station}>
                <text x={pad+labW-6} y={y+cH/2+4} textAnchor="end" fill="#e6edf3" fontSize={11}>{lbl}</text>
                {hours.map((hour,ci)=>{
                  const val=st.hourBuckets[hour]||0
                  const cx=labW+ci*cW+pad
                  const disp=val>=1000?`${(val/1000).toFixed(1)}k`:val>0?String(val):''
                  const tc=val/maxV>.45?'#e6edf3':'#8b949e'
                  return (
                    <g key={hour}>
                      <rect x={cx+1} y={y+1} width={cW-2} height={cH-2} rx={3} fill={getColor(val,maxV)}/>
                      {disp && <text x={cx+cW/2} y={y+cH/2+4} textAnchor="middle" fill={tc} fontSize={10}>{disp}</text>}
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>
      </div>
    </>
  )
}
