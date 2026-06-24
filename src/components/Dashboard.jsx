import React, { useState, useCallback } from 'react'
import StatCard from './StatCard'
import TimelineChart from './TimelineChart'
import TopStationsChart from './TopStationsChart'
import StationDetailChart from './StationDetailChart'
import HeatmapSvg from './HeatmapSvg'
import FlowChart from './FlowChart'
import KltTrace from './KltTrace'
import StationsTable from './StationsTable'
import FilterBar from './FilterBar'
import { chronoHours } from '../utils/parser'

export default function Dashboard({ allData, stStats, flowData, parseStatus, onParse, onClear }) {
  const [pasteText, setPasteText]   = useState('')
  const [filters, setFilters]       = useState({ barcode:'', station:'', hour:'' })
  const [timelineRes, setTimelineRes]           = useState(15)
  const [timelineDuplicates, setTimelineDuplicates] = useState(false)
  const [stationMode, setStationMode] = useState('hour')
  const [selectedStation, setSelectedStation] = useState('')
  const [heatN, setHeatN]           = useState(25)
  const [kltSearch, setKltSearch]   = useState('')

  // Apply filters
  const filtered = allData.filter(d => {
    if (filters.barcode && !d.barcode.includes(filters.barcode)) return false
    if (filters.station && d.station !== filters.station) return false
    if (filters.hour !== '' && d.hour !== parseInt(filters.hour)) return false
    return true
  })

  const filteredStats = stStats.filter(s => {
    if (filters.station && s.station !== filters.station) return false
    if (filters.barcode) {
      const bc = filters.barcode
      return allData.some(d => d.barcode.includes(bc) && d.station === s.station)
    }
    return true
  })

  // Summary stats
  const total    = filtered.length
  const uniqueKlt = new Set(filtered.map(d => d.barcode)).size
  const uniqueSt  = new Set(filtered.map(d => d.station)).size
  const hb = {}; filtered.forEach(d => { hb[d.hour]=(hb[d.hour]||0)+1 })
  const peak = Object.entries(hb).sort((a,b)=>b[1]-a[1])[0]

  // All stations for dropdowns
  const allStations = [...new Set(allData.map(d => d.station))].sort()
  const allHours    = chronoHours(allData)

  const handleParse = () => onParse(pasteText)
  const handleClear = () => { onClear(); setPasteText(''); setFilters({barcode:'',station:'',hour:''}) }

  return (
    <main style={{padding:20,maxWidth:1500,margin:'0 auto'}}>

      {/* Input */}
      <div className="card" style={{padding:20,marginBottom:20}}>
        <div style={{fontSize:11,fontWeight:600,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>📋 Vložiť dáta z Excelu</div>
        <div style={{fontSize:11,color:'var(--text3)',marginBottom:10,lineHeight:1.6}}>
          Označte v Exceli všetky riadky (3 stĺpce: <code style={{background:'rgba(255,255,255,.07)',padding:'1px 5px',borderRadius:3,color:'var(--accent)'}}>Čiarový kód</code> · <code style={{background:'rgba(255,255,255,.07)',padding:'1px 5px',borderRadius:3,color:'var(--accent)'}}>Stanica</code> · <code style={{background:'rgba(255,255,255,.07)',padding:'1px 5px',borderRadius:3,color:'var(--accent)'}}>Dátum/čas</code>), skopírujte <kbd>Ctrl+C</kbd> a vložte sem <kbd>Ctrl+V</kbd>.
        </div>
        <textarea value={pasteText} onChange={e=>setPasteText(e.target.value)}
          style={{width:'100%',minHeight:100,resize:'vertical',fontFamily:'Consolas,Monaco,monospace'}}
          placeholder={"80145688\tL47\t23.06.2026 06:00:57\n80145688\tSO01\t23.06.2026 05:54:55\n..."}/>
        <div style={{display:'flex',gap:10,marginTop:10,alignItems:'center'}}>
          <button className="btn" onClick={handleParse}>▶ Analyzovať</button>
          <button className="btn-ghost" onClick={handleClear}>✕ Vymazať</button>
          <span style={{fontSize:12,color:parseStatus.ok?'var(--accent2)':'var(--accent3)'}}>{parseStatus.msg}</span>
        </div>
      </div>

      {allData.length > 0 && <>
        {/* Filters */}
        <FilterBar filters={filters} onChange={setFilters} stations={allStations} hours={allHours} total={total} allTotal={allData.length} />

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
          <StatCard label="Zobrazené záznamy" value={total.toLocaleString('sk')} sub={total<allData.length?`z celkových ${allData.length.toLocaleString('sk')}`:'priechodov celkovo'} accent={0}/>
          <StatCard label="KLT prepravky"     value={uniqueKlt.toLocaleString('sk')} sub="unikátnych KLT" accent={1}/>
          <StatCard label="Aktívne stanice"   value={uniqueSt} sub="unikátnych staníc" accent={2}/>
          <StatCard label="Vrcholová hodina"  value={peak?`${peak[0]}:00`:'—'} sub={peak?`${peak[1].toLocaleString('sk')} priechodov`:''} accent={3}/>
        </div>

        {/* Charts */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
          <div className="card" style={{padding:18,gridColumn:'1/-1'}}>
            <TimelineChart
              data={filtered}
              resolution={timelineRes}
              onResChange={setTimelineRes}
              showDuplicates={timelineDuplicates}
              onToggleDuplicates={setTimelineDuplicates}
            />
          </div>
          <div className="card" style={{padding:18}}>
            <TopStationsChart stStats={filteredStats} onSelect={st=>{setSelectedStation(st);setFilters(f=>({...f,station:st}))}}/>
          </div>
          <div className="card" style={{padding:18}}>
            <StationDetailChart allData={filtered} stStats={filteredStats} selected={selectedStation} onSelect={setSelectedStation} mode={stationMode} onModeChange={setStationMode}/>
          </div>
        </div>

        <div className="card" style={{padding:18,marginBottom:20}}>
          <HeatmapSvg stStats={filteredStats} allData={filtered} topN={heatN} onTopNChange={setHeatN}/>
        </div>

        <div className="card" style={{padding:18,marginBottom:20}}>
          <FlowChart flowData={flowData} stations={allStations}/>
        </div>

        <div className="card" style={{padding:18,marginBottom:20}}>
          <KltTrace allData={allData} search={kltSearch} onSearchChange={setKltSearch}/>
        </div>

        <div className="card" style={{overflow:'hidden',marginBottom:20}}>
          <StationsTable stStats={filteredStats} total={total} onFilterStation={st=>setFilters(f=>({...f,station:st}))}/>
        </div>
      </>}

      {!allData.length && (
        <div style={{textAlign:'center',padding:'60px 20px',color:'var(--text3)'}}>
          <div style={{fontSize:44,marginBottom:10}}>📂</div>
          <div style={{fontSize:15,color:'var(--text2)',marginBottom:6}}>Vložte dáta z Excelu</div>
          <div style={{fontSize:12,lineHeight:1.8}}>
            Označte všetky riadky v Exceli (Ctrl+A), skopírujte Ctrl+C<br/>a vložte priamo do poľa vyššie (Ctrl+V).<br/><br/>
            Každý riadok = jedna KLT prepravka na stanici v konkrétnom čase.
          </div>
        </div>
      )}
    </main>
  )
}
