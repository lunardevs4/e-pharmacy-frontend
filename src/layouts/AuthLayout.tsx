import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useLanguageStore } from '@/store/languageStore'
import LanguageSelector from '@/components/common/LanguageSelector'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  mode?: 'login' | 'register' | 'reset'
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  mode,
}: AuthLayoutProps) {
  const navigate = useNavigate()
  const { t } = useLanguageStore()

  const handleGoBack = () => {
    navigate('/', { replace: true })
  }

  const computedMode =
    mode ||
    (title?.toLowerCase().includes('register') ||
    title?.toLowerCase().includes('create') ||
    title?.toLowerCase().includes('account')
      ? 'register'
      : title?.toLowerCase().includes('password') ||
          title?.toLowerCase().includes('verify') ||
          title?.toLowerCase().includes('email') ||
          title?.toLowerCase().includes('check')
        ? 'reset'
        : 'login')

  const getPosterContent = () => {
    switch (computedMode) {
      case 'register':
        return {
          tagline: t('poster.register.tagline'),
          heading: t('poster.register.heading'),
          desc: t('poster.register.desc'),
        }

      case 'reset':
        return {
          tagline: t('poster.reset.tagline'),
          heading: t('poster.reset.heading'),
          desc: t('poster.reset.desc'),
        }

      case 'login':
      default:
        return {
          tagline: t('poster.login.tagline'),
          heading: t('poster.login.heading'),
          desc: t('poster.login.desc'),
        }
    }
  }

  const poster = getPosterContent()

  return (
    <div
      className="auth-layout min-h-screen w-full bg-[#EEF2F4] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12"
      style={{ fontFamily: 'var(--font-family-base)' }}
    >

      <div
        className="
          auth-layout-container
          relative
          w-full
          max-w-[1380px]
          h-auto
          lg:h-[calc(100vh-80px)]
          xl:h-[calc(100vh-96px)]
          min-h-[700px]
          lg:min-h-[620px]
          flex
          flex-col
          lg:flex-row
          overflow-hidden
          bg-white
          shadow-[0_25px_70px_rgba(6,78,59,0.14)]
        "
      >

        <section
          className="
            hidden
            lg:block
            relative
            w-full
            lg:w-1/2
            min-h-[390px]
            lg:min-h-0
            overflow-hidden
            bg-gradient-to-br
            from-[#064E3B]
            via-[#047857]
            to-[#059669]
            text-white
          "
        >

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-br
              from-[#064E3B]
              via-[#047857]
              to-[#10B981]
            "
          />

          <div
            className="absolute inset-0 pointer-events-none opacity-[0.12]"
            style={{
              backgroundImage: `
                linear-gradient(
                  rgba(255,255,255,0.55) 1px,
                  transparent 1px
                ),
                linear-gradient(
                  90deg,
                  rgba(255,255,255,0.55) 1px,
                  transparent 1px
                )
              `,
              backgroundSize: '42px 42px',
            }}
          />

          <div
            className="
              absolute
              -top-[25%]
              -right-[20%]
              w-[65%]
              aspect-square
              rounded-full
              bg-[#34D399]/15
              blur-3xl
              pointer-events-none
            "
          />

          <svg
            className="
              absolute
              top-0
              left-0
              w-full
              h-[42%]
              pointer-events-none
            "
            viewBox="0 0 1000 450"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="
                M0 120
                C120 190 170 250 300 230
                C430 210 430 75 560 90
                C690 105 710 300 850 285
                C930 276 970 220 1000 195
                L1000 0
                L0 0
                Z
              "
              fill="#34D399"
              fillOpacity="0.18"
            />

            <path
              d="
                M0 205
                C130 260 190 310 320 270
                C450 230 470 115 585 130
                C715 150 730 340 870 315
                C930 304 970 270 1000 240
                L1000 0
                L0 0
                Z
              "
              fill="#6EE7B7"
              fillOpacity="0.12"
            />
          </svg>

          <svg
            className="
              absolute
              bottom-0
              left-0
              w-full
              h-[45%]
              pointer-events-none
            "
            viewBox="0 0 1000 500"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="
                M0 330
                C120 300 170 410 310 390
                C450 370 510 285 630 315
                C760 348 805 445 1000 355
                L1000 500
                L0 500
                Z
              "
              fill="#022C22"
              fillOpacity="0.32"
            />

            <path
              d="
                M0 390
                C130 350 205 435 330 420
                C460 405 520 330 650 345
                C780 360 850 445 1000 390
                L1000 500
                L0 500
                Z
              "
              fill="#34D399"
              fillOpacity="0.22"
            />

            <path
              d="
                M0 350
                C110 320 180 390 300 375
                C430 360 520 300 640 325
                C770 350 850 410 1000 330
                L1000 500
                L0 500
                Z
              "
              fill="white"
              fillOpacity="0.06"
            />

            <path
              d="
                M0 430
                C130 380 220 450 350 440
                C490 428 550 370 690 390
                C820 410 880 460 1000 420
                L1000 500
                L0 500
                Z
              "
              fill="#10B981"
              fillOpacity="0.25"
            />
          </svg>

          <div className="absolute inset-0 pointer-events-none overflow-hidden">

            <div
              className="
                absolute
                top-[8%]
                right-[8%]
                w-[180px]
                h-px
                bg-white/20
                rotate-[-45deg]
              "
            />

            <div
              className="
                absolute
                top-[14%]
                right-[3%]
                w-[140px]
                h-px
                bg-white/10
                rotate-[-45deg]
              "
            />

            <div
              className="
                absolute
                bottom-[17%]
                left-[-20px]
                w-[220px]
                h-px
                bg-white/20
                rotate-[-45deg]
              "
            />

            <div
              className="
                absolute
                bottom-[10%]
                left-[2%]
                w-[170px]
                h-px
                bg-white/10
                rotate-[-45deg]
              "
            />

          </div>

          <div
            className="
              absolute
              top-[8%]
              right-[10%]
              w-20
              h-20
              rounded-full
              border
              border-white/20
              pointer-events-none
            "
          />

          <div
            className="
              absolute
              top-[8%]
              right-[10%]
              w-12
              h-12
              translate-x-4
              translate-y-4
              rounded-full
              border
              border-white/25
              pointer-events-none
            "
          />

          <div
            className="
              absolute
              bottom-[18%]
              left-[9%]
              w-16
              h-16
              rounded-full
              border
              border-white/15
              pointer-events-none
            "
          />

          <div
            className="
              absolute
              bottom-[18%]
              left-[9%]
              w-8
              h-8
              translate-x-4
              translate-y-4
              rounded-full
              border
              border-white/20
              pointer-events-none
            "
          />

          <span className="absolute top-[22%] left-[16%] w-2 h-2 rounded-full bg-[#6EE7B7]/70" />
          <span className="absolute top-[29%] left-[39%] w-3 h-3 rounded-full bg-white/20" />
          <span className="absolute top-[37%] right-[18%] w-2 h-2 rounded-full bg-[#A7F3D0]/60" />
          <span className="absolute bottom-[29%] left-[28%] w-2.5 h-2.5 rounded-full bg-[#34D399]/70" />
          <span className="absolute bottom-[21%] right-[28%] w-2 h-2 rounded-full bg-white/20" />
          <span className="absolute bottom-[12%] right-[15%] w-1.5 h-1.5 rounded-full bg-white/30" />

          <Link
            to="/"
            className="absolute top-8 left-8 md:top-10 md:left-10 z-20 flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div
              className="
                w-9
                h-9
                flex
                items-center
                justify-center
                bg-white
                rounded-[5px]
                shadow-lg
                p-1
              "
            >
              <img
                src="/logo1.png"
                alt="E-Pharmacy Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <span className="text-sm md:text-base font-semibold tracking-[0.16em] text-white">
              E-PHARMACY
            </span>
          </Link>

          <div
            className="
              relative
              z-10
              flex
              flex-col
              justify-center
              items-center
              text-center
              h-full
              px-8
              py-28
              md:px-12
            "
          >

            <div className="max-w-[520px]">

              <p className="text-sm md:text-base text-white/80 font-medium tracking-wide mb-3">
                {poster.tagline}
              </p>

              <h1
                className="
                  text-4xl
                  sm:text-5xl
                  lg:text-4xl
                  xl:text-5xl
                  font-light
                  tracking-[0.06em]
                  text-white
                "
              >
                {poster.heading}
              </h1>

              <div className="flex justify-center my-6">
                <div className="w-10 h-[3px] bg-white rounded-full" />
              </div>

              <p
                className="
                  max-w-[430px]
                  mx-auto
                  text-xs
                  sm:text-sm
                  leading-6
                  text-white/75
                "
              >
                {poster.desc}
              </p>

            </div>
          </div>

          <div
            className="
              absolute
              bottom-6
              left-8
              md:left-10
              z-20
              text-[10px]
              tracking-wide
              text-white/40
            "
          >
            © {new Date().getFullYear()} E-Pharmacy National Digital Portal
          </div>

        </section>

        <section
          className={`
            relative
            w-full
            lg:w-1/2
            min-h-[600px]
            lg:min-h-0
            bg-white
            flex
            ${computedMode === 'register' ? 'items-start pt-20 md:pt-28 pb-12' : 'items-start pt-20 pb-10 lg:items-center lg:py-16'}
            justify-center
            px-6
            sm:px-10
            md:px-16
            lg:px-14
            xl:px-20
            overflow-y-auto
          `}
        >
          {/* Language Selector */}
          <div className="absolute top-5 left-6 md:top-6 md:left-8 z-30">
            <LanguageSelector />
          </div>

          {/* Go Back button */}
          <button
            onClick={handleGoBack}
            className="
              absolute
              top-5
              right-6
              md:top-6
              md:right-8
              flex
              items-center
              gap-1.5
              text-xs
              font-bold
              text-gray-500
              hover:text-[#059669]
              transition-colors
              z-30
              cursor-pointer
            "
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('auth.goBack')}</span>
          </button>

          <div className="w-full max-w-[440px] py-2 sm:py-3">

            <div className="lg:hidden flex justify-center mb-6">
              <Link
                to="/"
                className="
                  w-12
                  h-12
                  flex
                  items-center
                  justify-center
                  bg-white
                  border
                  border-gray-150
                  rounded-[5px]
                  shadow-sm
                  p-1.5
                  hover:opacity-90
                  transition-opacity
                  cursor-pointer
                "
              >
                <img
                  src="/logo1.png"
                  alt="E-Pharmacy Logo"
                  className="w-full h-full object-contain"
                />
              </Link>
            </div>

            {title && (
              <div className="mb-4">

                <h2
                  className="
                    text-xl
                    sm:text-2xl
                    font-bold
                    tracking-tight
                    text-[#172033]
                  "
                >
                  {title}
                </h2>

                {subtitle && (
                  <p
                    className="
                      text-[#64748B]
                      text-sm
                      mt-1.5
                      leading-5
                    "
                  >
                    {subtitle}
                  </p>
                )}

              </div>
            )}

            {children}

          </div>

        </section>

      </div>

      <style>{`

        .auth-layout-container input,
        .auth-layout-container select,
        .auth-layout-container textarea,
        .auth-layout-container button,
        .auth-layout-container label {
          font-family: var(--font-family-base), "Source Sans 3", 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }


        .auth-layout-container .auth-input {
          background-color: #F7F8FA !important;
          border: none !important;
          border-left: 4px solid #059669 !important;
          border-radius: 4px !important;
          font-size: 14px !important;
          padding-top: 8px !important;
          padding-bottom: 8px !important;
          min-height: 38px !important;
          transition:
            background-color 180ms ease,
            border-color 180ms ease,
            box-shadow 180ms ease !important;
          box-shadow:
            inset 0 1px 2px rgba(0, 0, 0, 0.025) !important;
        }

        .auth-layout-container .auth-input:hover {
          background-color: #F1FDF8 !important;
        }

        .auth-layout-container .auth-input:focus {
          background-color: #FFFFFF !important;
          border-left-color: #047857 !important;
          outline: none !important;
          box-shadow:
            0 0 0 3px rgba(5, 150, 105, 0.12) !important;
        }

        .auth-layout-container .auth-input.error {
          border-left-color: #EF4444 !important;
        }

        
        .auth-layout-container label:not([for="terms"]):not([for="privacy"]):not([for="remember_me"]):not([for="remember-me"]) {
          font-size: 13px !important;
          margin-bottom: 4px !important;
          font-weight: 600 !important;
          color: #374151 !important;
          display: block !important;
        }

        .auth-layout-container label[for="terms"],
        .auth-layout-container label[for="privacy"],
        .auth-layout-container label[for="remember_me"],
        .auth-layout-container label[for="remember-me"] {
          font-size: 13px !important;
          font-weight: 500 !important;
          color: #4B5563 !important;
          margin-bottom: 0 !important;
        }


        .auth-layout-container .auth-button {
          background-color: #059669 !important;
          color: #FFFFFF !important;
          border-radius: 6px !important;
          min-height: 40px !important;
          padding-top: 8px !important;
          padding-bottom: 8px !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          transition:
            background-color 180ms ease,
            transform 180ms ease,
            box-shadow 180ms ease !important;
          box-shadow:
            0 4px 10px rgba(5, 150, 105, 0.12) !important;
        }

        .auth-layout-container .auth-button:hover:not(:disabled) {
          background-color: #047857 !important;
          box-shadow:
            0 6px 15px rgba(5, 150, 105, 0.18) !important;
        }

        .auth-layout-container .auth-button:active:not(:disabled) {
          transform: translateY(1px);
        }

        .auth-layout-container .auth-button:disabled {
          opacity: 0.65 !important;
          cursor: not-allowed !important;
        }


        .auth-layout-container .auth-card {
          border-radius: 8px !important;
          border: 1px solid #E5E7EB !important;
          background-color: #FFFFFF !important;
        }


        .auth-layout-container select.auth-input {
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E") !important;

          background-position:
            right 0.65rem center !important;

          background-repeat:
            no-repeat !important;

          background-size:
            1.25rem 1.25rem !important;

          padding-right:
            2.5rem !important;

          appearance:
            none !important;
          
          padding-top: 8px !important;
          padding-bottom: 8px !important;
          min-height: 38px !important;
          font-size: 14px !important;
        }


        .auth-layout-container a {
          color: #059669;
          transition: color 160ms ease;
        }

        .auth-layout-container a:hover {
          color: #047857;
        }


        .auth-layout-container input[type="checkbox"] {
          accent-color: #059669;
        }


        @media (max-width: 1023px) {

          .auth-layout-container {
            min-height: auto !important;
          }

          .auth-layout-container > section:first-child {
            min-height: 390px;
          }

          .auth-layout-container > section:last-child {
            min-height: 600px;
          }

        }

        @media (max-width: 640px) {

          .auth-layout {
            padding: 0 !important;
          }

          .auth-layout-container {
            box-shadow: none !important;
          }

          .auth-layout-container > section:first-child {
            min-height: 350px;
          }

          .auth-layout-container > section:last-child {
            min-height: 620px;
          }

        }

      `}</style>

    </div>
  )
}
