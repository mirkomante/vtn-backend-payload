'use client'

import { useEffect } from 'react'

export default function LoginView() {
  useEffect(() => {
    // Disabilita lo scroll del body quando il componente è montato
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.documentElement.style.margin = '0'
    document.documentElement.style.padding = '0'

    // Ripristina quando il componente viene smontato
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      document.body.style.margin = ''
      document.body.style.padding = ''
      document.documentElement.style.margin = ''
      document.documentElement.style.padding = ''
    }
  }, [])

  const handleGoogleLogin = () => {
    // Reindirizza all'endpoint OAuth configurato nel plugin
    // Gli endpoint sono registrati sotto /api/{collection-slug}/{path}
    window.location.href = '/api/users/oauth/google/authorize'
  }

  return (
    <div className="twfixed twinset-0 twflex twflex-col twitems-center twjustify-center twp-8 twoverflow-hidden twm-0 tww-full twh-full">
      <div className="tww-full twmax-w-[400px] twp-8 twbg-payload-elevation-50 twrounded-m-payload twflex twflex-col twitems-center twmx-auto">
        <h1 className="twmb-4 twtext-center twtext-2xl twfont-bold twtext-payload-text">
          Accedi al pannello admin
        </h1>
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="tww-full twflex twitems-center twjustify-center twgap-5 twbg-[#4285F4] hover:twbg-[#357ae8] twtext-white twborder-none twpx-6 twpy-3 twtext-base twfont-medium twcursor-pointer twtext-center twrounded-s-payload twtransition-colors twduration-200"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0, marginRight: '0.5rem' }}
          >
            <path
              d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H15.9564C17.4382 14.5227 18.3636 12.5455 18.3636 9.20454H17.64Z"
              fill="white"
            />
            <path
              d="M9 18C11.43 18 13.467 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65454 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z"
              fill="white"
            />
            <path
              d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z"
              fill="white"
            />
            <path
              d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65454 3.57955 9 3.57955Z"
              fill="white"
            />
          </svg>
          <span>Accedi con Google</span>
        </button>
      </div>
    </div>
  )
}
