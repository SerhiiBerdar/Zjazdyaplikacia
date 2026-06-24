import { useState, useEffect, useRef, useCallback } from 'react'
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

const MIN_ZOOM = 0.05
const MAX_ZOOM = 4

export default function ExpLayout({ allData, stStats }) {
  const [svgContent, setSvgContent] = useState('')
  const [selected, setSelected]     = useState(null)
  const [view, setView]             = useState({ scale: 1, x: 0, y: 0 })
  const svgRef   = useRef(null)   // holds the injected <svg>
  const viewportRef = useRef(null) // clipping viewport
  const natural  = useRef({ w: 0, h: 0 })
  const drag     = useRef(null)
  const moved    = useRef(false)

  useEffect(() => {
    fetch('/expLayout.svg').then(r => r.text()).then(setSvgContent)
  }, [])

  // fit the whole layout into the viewport
  const fitToView = useCallback(() => {
    const vp = viewportRef.current
    const { w, h } = natural.current
    if (!vp || !w || !h) return
    const pad = 24
    const scale = Math.min((vp.clientWidth - pad) / w, (vp.clientHeight - pad) / h)
    setView({ scale, x: (vp.clientWidth - w * scale) / 2, y: (vp.clientHeight - h * scale) / 2 })
  }, [])

  useEffect(() => {
    if (!svgContent || !svgRef.current) return
    svgRef.current.innerHTML = svgContent
    const svg = svgRef.current.querySelector('svg')
    if (svg) {
      const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number)
      natural.current = { w: vb[2] || svg.width?.baseVal?.value || 1000, h: vb[3] || svg.height?.baseVal?.value || 1000 }
      // let the wrapper transform drive sizing
      svg.removeAttribute('width'); svg.removeAttribute('height')
      svg.style.width  = natural.current.w + 'px'
      svg.style.height = natural.current.h + 'px'
      svg.style.display = 'block'
    }
    svgRef.current.querySelectorAll('.mz-station').forEach(el => {
      el.style.cursor = 'pointer'
      el.addEventListener('click', () => {
        if (moved.current) return            // ignore click that ended a pan
        const id = el.dataset.label
        const type = el.dataset.type
        if (id) setSelected({ id, type })
      })
    })
    fitToView()
  }, [svgContent, fitToView])

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

  // ---- zoom / pan ----
  const zoomBy = useCallback((factor, cx, cy) => {
    setView(v => {
      const vp = viewportRef.current
      const px = cx ?? (vp ? vp.clientWidth / 2 : 0)
      const py = cy ?? (vp ? vp.clientHeight / 2 : 0)
      const scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.scale * factor))
      const k = scale / v.scale
      return { scale, x: px - (px - v.x) * k, y: py - (py - v.y) * k }
    })
  }, [])

  const onWheel = useCallback((e) => {
    e.preventDefault()
    const rect = viewportRef.current.getBoundingClientRect()
    zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - rect.left, e.clientY - rect.top)
  }, [zoomBy])

  const onPointerDown = (e) => {
    drag.current = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y }
    moved.current = false
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.sx
    const dy = e.clientY - drag.current.sy
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved.current = true
    setView(v => ({ ...v, x: drag.current.ox + dx, y: drag.current.oy + dy }))
  }
  const onPointerUp = (e) => {
    drag.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    // clear "moved" shortly after so the synthetic click is suppressed but next ones work
    setTimeout(() => { moved.current = false }, 0)
  }

  const expNames  = new Set(EXP_NODES.map(n => n.id.toUpperCase()))
  const expData   = stStats.filter(s => expNames.has(s.station.toUpperCase()))
  const expTotal  = expData.reduce((s,n) => s+n.count, 0)
  const expActive = expData.length
  const expKlt    = new Set(allData.filter(d => expNames.has(d.station.toUpperCase())).map(d => d.barcode)).size
  const hb = {}; allData.forEach(d => { hb[d.hour] = (hb[d.hour]||0)+1 })
  const peak = Object.entries(hb).sort((a,b) => b[1]-a[1])[0]

  const btn = {
    width: 34, height: 34, borderRadius: 8, cursor: 'pointer',
    background: 'var(--panel)', border: '1px solid var(--border)',
    color: 'var(--text2)', fontSize: 16, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }

  return (
    <div style={{ padding: 20, maxWidth: 1600, margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>📦 Expedičná časť — linky &amp; výstupné stanice</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Klikni na stanicu → detail · Ťahaj myšou = posun · Koliesko / tlačidlá = priblíženie</div>
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

      <div style={{ position: 'relative', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div
          ref={viewportRef}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          style={{ width: '100%', height: '72vh', overflow: 'hidden', cursor: drag.current ? 'grabbing' : 'grab', touchAction: 'none' }}
        >
          <div
            ref={svgRef}
            style={{ transformOrigin: '0 0', transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`, willChange: 'transform' }}
          />
        </div>

        {/* zoom controls */}
        <div style={{ position: 'absolute', right: 12, bottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button title="Priblížiť"  style={btn} onClick={() => zoomBy(1.25)}>+</button>
          <button title="Oddialiť"   style={btn} onClick={() => zoomBy(1/1.25)}>−</button>
          <button title="Prispôsobiť" style={{ ...btn, fontSize: 13 }} onClick={fitToView}>⤢</button>
        </div>
        <div style={{ position: 'absolute', left: 12, bottom: 12, fontSize: 11, color: 'var(--text3)', background: 'rgba(0,0,0,.35)', padding: '3px 8px', borderRadius: 6 }}>
          {Math.round(view.scale * 100)} %
        </div>
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
