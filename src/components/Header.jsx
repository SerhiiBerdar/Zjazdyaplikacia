import { useState, useEffect, useRef } from 'react'
export default function Header({ recordCount }) {
  return (
    <header style={{
      background: 'var(--panel)', borderBottom: '1px solid var(--border)',
      padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12,
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        width: 30, height: 30,
        background: 'linear-gradient(135deg,#58a6ff,#d2a8ff)',
        borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
      }}>🚉</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Analýza Vytaženosti Zjazdov</div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1 }}>Pohyb KLT prepraviek cez stanice v čase</div>
      </div>
      <div style={{
        marginLeft: 'auto',
        background: 'rgba(88,166,255,.12)', border: '1px solid rgba(88,166,255,.3)',
        color: 'var(--accent)', fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20,
      }}>
        {recordCount > 0 ? `${recordCount.toLocaleString('sk')} záznamov` : 'Žiadne dáta'}
      </div>
    </header>
  )
}
