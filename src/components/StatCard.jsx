const ACCENT_COLORS = ['var(--accent)', 'var(--accent2)', 'var(--accent4)', 'var(--accent3)']
const GLOW_COLORS   = [
  'rgba(200,255,0,0.22)',
  'rgba(34,211,238,0.22)',
  'rgba(167,139,250,0.22)',
  'rgba(255,77,109,0.22)',
]

export default function StatCard({ label, value, sub, accent }) {
  const aColor   = typeof accent === 'number' ? ACCENT_COLORS[accent] : (accent || ACCENT_COLORS[0])
  const glowColor = typeof accent === 'number' ? GLOW_COLORS[accent] : GLOW_COLORS[0]

  return (
    <div
      className="card"
      style={{ padding: '20px 20px 18px', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${glowColor}`
      }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '' }}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
        background: aColor,
        boxShadow: `0 0 16px ${glowColor}`,
        borderRadius: '3px 0 0 3px',
      }} />

      {/* Subtle top-left glow blob */}
      <div style={{
        position: 'absolute', top: -30, left: -10, width: 100, height: 80,
        background: glowColor,
        filter: 'blur(30px)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      <div style={{ paddingLeft: 10, position: 'relative' }}>
        <div style={{
          fontSize: 10, color: 'var(--text2)',
          textTransform: 'uppercase', letterSpacing: '.12em',
          fontWeight: 600, marginBottom: 10,
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 40, fontWeight: 800,
          color: aColor,
          letterSpacing: '0.02em',
          lineHeight: 1,
          textShadow: `0 0 24px ${glowColor}`,
        }}>
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 7, letterSpacing: '0.02em' }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}
