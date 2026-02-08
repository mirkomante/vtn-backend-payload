/**
 * LoginView Component - Custom login page for Payload Admin
 * Server Component (default) - renders on server
 * Usa Tailwind CSS per lo styling e si adatta al tema light/dark di Payload
 */

export default function LoginView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-[var(--theme-bg)]">
      <div className="flex flex-col items-center gap-6 text-center max-w-md w-full">
        <p className="text-[var(--theme-text)] text-base mb-2">
          Accedi al backend.
        </p>

        <a
          href="/api/users/oauth/google/authorize"
          className="inline-flex items-center justify-center gap-3 bg-[#4285F4] text-white px-7 py-3.5 rounded-lg no-underline text-base font-medium w-full transition-all duration-200 hover:bg-[#357ae8] hover:shadow-lg"
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
      </div>
    </div>
  )
}
