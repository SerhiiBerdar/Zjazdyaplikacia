import { useState, useEffect, useRef } from 'react'
export default function StatCard({ label, value, sub, accent }) {
  const colors = ['var(--accent)', 'var(--accent2)', 'var(--accent4)', 'var(--accent3)']
  return (
    <div style={{
      background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12,
      padding: '16px 18px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: accent || 'var(--accent)',
      }} />
      <div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 500, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}
