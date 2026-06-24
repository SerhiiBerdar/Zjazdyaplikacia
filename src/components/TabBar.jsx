export default function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      background: 'rgba(10,10,15,0.75)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      position: 'sticky', top: 62, zIndex: 99,
      padding: '0 16px',
      gap: 2,
    }}>
      {tabs.map(t => {
        const isActive = active === t.id
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              padding: '15px 22px',
              fontSize: 13, fontWeight: isActive ? 600 : 500,
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
              color: isActive ? 'var(--accent)' : 'var(--text2)',
              transition: 'all var(--dur) var(--ease)',
              fontFamily: 'var(--font-body)',
              textShadow: isActive ? '0 0 24px rgba(200,255,0,0.55)' : 'none',
              letterSpacing: '0.01em',
              position: 'relative',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text2)' }}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
