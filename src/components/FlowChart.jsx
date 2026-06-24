import React, { useState, useMemo } from 'react'

export default function FlowChart({ flowData, stations }) {
  const [fromF, setFromF] = useState('')
  const [toF,   setToF]   = useState('')
  const [dest,  setDest]  = useState('')
  const [topN,  setTopN]  = useState(20)

  const pairs = useMemo(() => {
    let result = Object.values(flowData.pairs||{})
      .map(p=>({...p, arrived: dest ? [...p.barcodes].filter(bc=>flowData.kltStations[bc]?.has(dest)).length : null}))
      .filter(p=>(!fromF||p.from===fromF)&&(!toF||p.to===toF))
      .sort((a,b)=>b.count-a.count)
    if (topN>0) result=result.slice(0,topN)
    return result
  }, [flowData, fromF, toF, dest, topN])

  const maxCount = pairs[0]?.count || 1
  const sel = {width:'100%'}

  return (
    <>
      <div style={{fontSize:13,fontWeight:600,marginBottom:3}}>🔀 Tok KLT medzi stanicami</div>
      <div style={{fontSize:11,color:'var(--text3)',marginBottom:12}}>Koľko KLT prešlo priamo zo stanice A na stanicu B</div>
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:14}}>
        {[['Zdrojová (Od)',fromF,setFromF],['Ďalšia (Do)',toF,setToF],['✅ Dorazilo na',dest,setDest]].map(([label,val,set])=>(
          <div key={label} style={{flex:1,minWidth:140}}>
            <div style={{fontSize:10,fontWeight:600,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>{label}</div>
            <select style={sel} value={val} onChange={e=>set(e.target.value)}>
              <option value="">{label.includes('Dorazilo')?'— nezobrazovať —':'— všetky —'}</option>
              {stations.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}
        <div style={{flex:1,minWidth:120}}>
          <div style={{fontSize:10,fontWeight:600,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>Zobraziť top</div>
          <select style={sel} value={topN} onChange={e=>setTopN(+e.target.value)}>
            <option value={20}>Top 20</option><option value={50}>Top 50</option><option value={0}>Všetky</option>
          </select>
        </div>
      </div>
      {!pairs.length
        ? <div style={{textAlign:'center',padding:30,color:'var(--text3)',fontSize:12}}>Žiadne toky pre zvolené kritériá</div>
        : <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
              <thead><tr style={{borderBottom:'1px solid var(--border)'}}>
                {['Stanica Od → Do','','Počet KLT',dest&&'✅ Dorazilo',dest&&'%'].filter(Boolean).map(h=>(
                  <th key={h} style={{textAlign:'left',padding:'8px 10px',fontSize:10,fontWeight:600,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'.06em'}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {pairs.map((p,i)=>{
                  const ratio=p.count/maxCount
                  const pct=p.arrived!=null?Math.round(p.arrived/p.count*100):null
                  return (
                    <tr key={i} style={{borderBottom:'1px solid rgba(48,54,61,.4)'}}>
                      <td style={{padding:'8px 10px',fontWeight:500}}>{p.from} → {p.to}</td>
                      <td style={{padding:'4px 10px',width:300}}>
                        <div style={{height:6,background:'var(--bg)',borderRadius:3,overflow:'hidden'}}>
                          <div style={{height:'100%',width:`${ratio*100}%`,background:ratio>.8?'#58a6ff':ratio>.5?'#388bfd':ratio>.3?'#0969da':'#0550ae',borderRadius:3}}/>
                        </div>
                      </td>
                      <td style={{padding:'8px 10px',fontWeight:700}}>{p.count.toLocaleString('sk')}</td>
                      {dest && <td style={{padding:'8px 10px',color:pct>50?'#3fb950':pct>25?'#f8961e':'#f78166',fontWeight:600}}>{p.arrived?.toLocaleString('sk')}</td>}
                      {dest && <td style={{padding:'8px 10px',color:'var(--text3)'}}>{pct}%</td>}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
      }
    </>
  )
}
