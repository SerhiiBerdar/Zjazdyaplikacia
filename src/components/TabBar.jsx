import { useState, useEffect, useRef } from 'react'
export default function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      background: 'var(--panel)', borderBottom: '1px solid var(--border)',
      display: 'flex', position: 'sticky', top: 57, zIndex: 99,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: '13px 24px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          background: 'transparent', border: 'none', borderBottom: `3px solid ${active === t.id ? 'var(--accent)' : 'transparent'}`,
          color: active === t.id ? 'var(--accent)' : 'var(--text2)',
          transition: 'all .2s',
        }}>{t.label}</button>
      ))}
    </div>
  )
}
