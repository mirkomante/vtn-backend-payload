/**
 * LoginView Component - Custom login page for Payload Admin
 * Server Component (default) - renders on server
 */

export default function LoginView() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '48px',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <h1
          style={{
            marginBottom: '8px',
            color: '#1a1a2e',
            fontSize: '28px',
            fontWeight: '700',
          }}
        >
          VTN Admin
        </h1>
        <p
          style={{
            marginBottom: '32px',
            color: '#6b7280',
            fontSize: '14px',
          }}
        >
          Vietnam on a Mour - Gestione Contenuti
        </p>

        <a
          href="/api/users/oauth/google/authorize"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            backgroundColor: '#4285F4',
            color: 'white',
            padding: '14px 28px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '500',
            width: '100%',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px -1px rgba(66, 133, 244, 0.3)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
            <path
              d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20454Z"
              fill="white"
            />
            <path
              d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z"
              fill="white"
            />
            <path
              d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z"
              fill="white"
            />
            <path
              d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L14.9564 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z"
              fill="white"
            />
          </svg>
          Accedi con Google
        </a>

        <p
          style={{
            marginTop: '24px',
            color: '#9ca3af',
            fontSize: '13px',
          }}
        >
          Usa il tuo account Google aziendale
        </p>
      </div>
    </div>
  )
}
