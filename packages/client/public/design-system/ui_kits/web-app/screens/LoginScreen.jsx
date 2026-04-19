// LoginScreen — Family Tree login page
function LoginScreen({ onLogin }) {
  const [loginVal, setLoginVal] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [remember, setRemember] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [pending, setPending] = React.useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!loginVal.trim() || !password) { setError('Please enter login and password.'); return; }
    setPending(true);
    setTimeout(() => {
      setPending(false);
      if (loginVal === 'wrong') { setError('Invalid credentials'); return; }
      onLogin && onLogin();
    }, 600);
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 49px)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 24, padding: 24,
      background: 'var(--md-sys-color-background)',
    }}>
      <h1 style={{ margin: 0, fontSize: 45, fontWeight: 400, color: 'var(--md-sys-color-on-surface)' }}>
        Family Tree
      </h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 360 }}
      >
        <TextField
          label="Login"
          value={loginVal}
          onChange={setLoginVal}
          error={!!error}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          error={!!error}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <div
            onClick={() => setRemember(r => !r)}
            style={{
              width: 18, height: 18, border: `2px solid ${remember ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'}`,
              borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: remember ? 'var(--md-sys-color-primary)' : 'transparent', flexShrink: 0,
              cursor: 'pointer',
            }}
          >
            {remember && <span style={{ color: '#fff', fontSize: 14, lineHeight: 1, fontWeight: 700 }}>✓</span>}
          </div>
          <span style={{ fontSize: 14, color: 'var(--md-sys-color-on-surface)' }}>Remember me</span>
        </label>
        {error && (
          <p style={{ margin: 0, fontSize: 12, color: 'var(--md-sys-color-error)' }}>{error}</p>
        )}
        <Btn icon="login" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign In'}
        </Btn>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--md-sys-color-on-surface-variant)', textAlign: 'center' }}>
          Try: any login / any password (not "wrong")
        </p>
      </form>
    </div>
  );
}
Object.assign(window, { LoginScreen });
