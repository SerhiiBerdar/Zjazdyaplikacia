import { useState, useEffect, useRef } from 'react'
import { EXP_NODES } from '../data/expNodes'
import StationPopup from './StationPopup'
import StatCard from './StatCard'

function heatFill(ratio, type) {
  if (!ratio) return null
  const t = Math.min(ratio, 1)
  if (type === 'D') return `rgba(${Math.round(200+t*55)},${Math.round(20+t*20)},20,${(0.3+t*0.6).toFixed(2)})`
  if (type === 'X') return `rgba(130,60,230,${(0.4+t*0.55).toFixed(2)})`
  return `rgba(20,${Math.round(160+t*90)},${Math.round(50+t*170)},${(0.3+t*0.6).toFixed(2)})`
}

export default function ExpLayout({ allData, stStats }) {
  const [svgContent, setSvgContent] = useState('')
  const [selected, setSelected]     = useState(null)
  const svgRef = useRef(null)

  useEffect(() => {
    fetch('/expLayout.svg').then(r => r.text()).then(setSvgContent)
  }, [])

  useEffect(() => {
    if (!svgContent || !svgRef.current) return
    svgRef.current.innerHTML = svgContent
    svgRef.current.querySelectorAll('.mz-station').forEach(el => {
      el.style.cursor = 'pointer'
      el.addEventListener('click', () => {
        const id = el.dataset.label
        const type = el.dataset.type
        if (id) setSelected({ id, type })
      })
    })
  }, [svgContent])

  useEffect(() => {
    if (!svgRef.current || !svgContent) return
    const maxCount = Math.max(...EXP_NODES.map(n => {
      const st = stStats.find(s => s.station.toUpperCase() === n.id.toUpperCase())
      return st?.count ?? 0
    }), 1)
    EXP_NODES.forEach(n => {
      const el = svgRef.current?.querySelector(`#hsr_${n.safeId}`)
      if (!el) return
      const st = stStats.find(s => s.station.toUpperCase() === n.id.toUpperCase())
      const ratio = (st?.count ?? 0) / maxCount
      const fill = heatFill(ratio, n.type)
      if (fill) {
        el.setAttribute('fill', fill)
        el.setAttribute('stroke-width', '2.5')
        el.setAttribute('stroke', n.type==='D' ? 'rgba(255,150,100,.9)' : n.type==='X' ? 'rgba(190,120,255,.9)' : 'rgba(100,240,140,.85)')
      } else {
        el.setAttribute('stroke', 'rgba(255,255,255,.12)')
        el.setAttribute('stroke-width', '1')
      }
    })
  }, [stStats, svgContent])

  const expNames  = new Set(EXP_NODES.map(n => n.id.toUpperCase()))
  const expData   = stStats.filter(s => expNames.has(s.station.toUpperCase()))
  const expTotal  = expData.reduce((s,n) => s+n.count, 0)
  const expActive = expData.length
  const expKlt    = new Set(allData.filter(d => expNames.has(d.station.toUpperCase())).map(d => d.barcode)).size
  const hb = {}; allData.forEach(d => { hb[d.hour] = (hb[d.hour]||0)+1 })
  const peak = Object.entries(hb).sort((a,b) => b[1]-a[1])[0]

  return (
    <div style={{ padding: 20, maxWidth: 1600, margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>📦 Expedičná časť — linky &amp; výstupné stanice</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Klikni na stanicu → detail priechodov · Farba = vyťaženosť</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard label="Záznamy v EXP"    value={expTotal.toLocaleString('sk')}  sub="priechodov celkovo"  accent="var(--accent)" />
        <StatCard label="Aktívne stanice"  value={expActive}                      sub="unikátnych staníc"   accent="var(--accent2)" />
        <StatCard label="KLT prepravky"    value={expKlt.toLocaleString('sk')}    sub="unikátnych KLT"      accent="var(--accent4)" />
        <StatCard label="Vrcholová hodina" value={peak ? `${peak[0]}:00` : '—'} sub={peak ? `${peak[1].toLocaleString('sk')} priechodov` : ''} accent="var(--accent3)" />
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 10, fontSize: 11, color: 'var(--text2)' }}>
        <span>🟥 Linka / Divertor</span><span>🟩 Stanica</span><span>🟣 Prítok / Transfer</span>
        <span style={{ color: 'var(--text3)' }}>· Jas = počet priechodov</span>
      </div>

      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div ref={svgRef} className="mz-svg-wrap" style={{ width: '100%', overflowX: 'auto' }} />
      </div>

      {!allData.length && (
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: 'var(--text3)' }}>
          Načítajte dáta v záložke Dashboard — stanice sa ofarbia podľa reálnej vyťaženosti
        </div>
      )}

      {selected && (
        <StationPopup
          station={selected.id} type={selected.type}
          allData={allData} stStats={stStats}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
