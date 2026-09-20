export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <h1 style={{ fontSize: '2rem' }}>Abatur Ministry</h1>
      <a href="/admin" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
        Войти в админку →
      </a>
    </div>
  )
}