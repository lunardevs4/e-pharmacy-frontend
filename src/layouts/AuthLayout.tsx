import React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

const SANS_BODY = "'Inter', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
const SERIF_HEAD = SANS_BODY
const BRAND = '#006846'
const BRAND_MID = '#005a3c'
const BRAND_DARK = '#004d33'

const RIGHT_GRADIENT = `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_MID} 50%, ${BRAND_DARK} 100%)`
const RIGHT_GRADIENT_STOPS = [
  { offset: '0%', color: BRAND },
  { offset: '50%', color: BRAND_MID },
  { offset: '100%', color: BRAND_DARK },
] as const

const PillIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M10.5 20.5a7 7 0 0 1 0-9.9l7-7a7 7 0 0 1 9.9 9.9l-7 7a7 7 0 0 1-9.9 0Z" />
    <path d="m8.5 8.5 7 7" />
  </svg>
)

const TruckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </svg>
)

const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const LeafSmallIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
  </svg>
)

/* =========================================================================
   Right Panel Promotional Content (shared by in-card right panel & blurred
   outer layer — so colors are guaranteed to be identical).
   ========================================================================= */
const RightPanelContent: React.FC = () => (
  <>
    {/* Uniform ambient depth overlay — no bright / dark splotches, just a smooth centered mint bloom + gentle top→bottom tint */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(900px 900px at 50% 50%, rgba(187, 247, 208, 0.10) 0%, rgba(134, 239, 172, 0.05) 55%, transparent 85%),' +
          'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.06) 100%)',
      }}
    />
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: 0.32,
        mixBlendMode: 'overlay',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
        backgroundSize: '5px 5px',
      }}
    />

    {/* Top-right medical cross accent */}
    <div
      className="absolute pointer-events-none"
      style={{ right: '38px', top: '42px', width: '90px', height: '90px', opacity: 0.38 }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="40" y="14" width="20" height="72" rx="6" fill="#FFFFFF" fillOpacity="0.22" />
        <rect x="14" y="40" width="72" height="20" rx="6" fill="#FFFFFF" fillOpacity="0.22" />
      </svg>
    </div>

    {/* Top-left concentric ring accent */}
    <div
      className="absolute pointer-events-none"
      style={{ left: '-70px', top: '-70px', width: '320px', height: '320px', opacity: 0.16 }}
    >
      <svg viewBox="0 0 400 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="tlConcentricGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#86EFAC" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#86EFAC" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="200" fill="url(#tlConcentricGlow)" />
        <circle cx="200" cy="200" r="180" stroke="#BBF7D0" strokeWidth="1.2" strokeOpacity="0.9" />
        <circle cx="200" cy="200" r="150" stroke="#86EFAC" strokeWidth="0.9" strokeOpacity="0.85" />
        <circle cx="200" cy="200" r="120" stroke="#BBF7D0" strokeWidth="0.8" strokeOpacity="0.7" strokeDasharray="3 7" />
        <circle cx="200" cy="200" r="90" stroke="#86EFAC" strokeWidth="0.7" strokeOpacity="0.6" />
        <circle cx="200" cy="200" r="60" stroke="#BBF7D0" strokeWidth="0.6" strokeOpacity="0.5" strokeDasharray="2 5" />
      </svg>
    </div>

    {/* Bottom-right cross + branch accent */}
    <div
      className="absolute pointer-events-none"
      style={{
        right: '24px',
        bottom: '-10px',
        width: '320px',
        height: '460px',
        opacity: 0.32,
      }}
    >
      <svg viewBox="0 0 320 460" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M240 460 C 240 380, 210 330, 220 250 C 228 180, 260 130, 250 60"
          stroke="#6EE7B7"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          strokeOpacity="0.6"
        />
        <ellipse cx="210" cy="380" rx="38" ry="54" fill="#86EFAC" fillOpacity="0.28" transform="rotate(-20 210 380)" />
        <path
          d="M172 386 C 196 356, 230 350, 248 368 C 232 398, 198 422, 172 422 C 162 422, 168 398, 172 386 Z"
          fill="#BBF7D0"
          fillOpacity="0.25"
        />
        <ellipse cx="196" cy="310" rx="30" ry="44" fill="#86EFAC" fillOpacity="0.25" transform="rotate(-30 196 310)" />
        <path
          d="M166 324 C 186 298, 212 294, 224 308 C 212 334, 188 352, 166 352 C 158 352, 162 334, 166 324 Z"
          fill="#BBF7D0"
          fillOpacity="0.22"
        />
        <ellipse cx="268" cy="334" rx="34" ry="50" fill="#86EFAC" fillOpacity="0.26" transform="rotate(20 268 334)" />
        <path
          d="M234 338 C 258 310, 288 306, 304 322 C 290 350, 262 374, 234 374 C 226 374, 230 352, 234 338 Z"
          fill="#BBF7D0"
          fillOpacity="0.22"
        />
        <ellipse cx="228" cy="200" rx="28" ry="42" fill="#86EFAC" fillOpacity="0.22" transform="rotate(-18 228 200)" />
        <path
          d="M200 214 C 222 188, 246 184, 258 198 C 246 222, 222 242, 200 242 C 192 242, 196 224, 200 214 Z"
          fill="#BBF7D0"
          fillOpacity="0.2"
        />
        <ellipse cx="292" cy="244" rx="30" ry="46" fill="#86EFAC" fillOpacity="0.22" transform="rotate(22 292 244)" />
        <path
          d="M262 248 C 284 220, 312 216, 326 232 C 314 258, 288 282, 262 282 C 254 282, 258 262, 262 248 Z"
          fill="#BBF7D0"
          fillOpacity="0.18"
        />
      </svg>
    </div>

    {/* Mint dot-grid accents */}
    <div
      className="absolute pointer-events-none"
      style={{
        right: '48px',
        top: '160px',
        width: '110px',
        height: '110px',
        opacity: 0.22,
        backgroundImage: 'radial-gradient(rgba(187, 247, 208, 0.9) 1.35px, transparent 1.35px)',
        backgroundSize: '9px 9px',
      }}
    />
    <div
      className="absolute pointer-events-none"
      style={{
        left: '42px',
        bottom: '42px',
        width: '150px',
        height: '150px',
        opacity: 0.22,
        backgroundImage: 'radial-gradient(rgba(187, 247, 208, 0.85) 1.35px, transparent 1.35px)',
        backgroundSize: '10px 10px',
      }}
    />

    {/* === Promotional heading + features === */}
    <div
      className="relative z-10 flex flex-col justify-center w-full h-full"
      style={{
        padding: '40px 60px 40px 80px',
        boxSizing: 'border-box' as const,
        maxHeight: '100%',
      }}
    >
      <div className="mb-10">
        <h2
          style={{
            fontSize: 'clamp(28px, 2.4vw, 40px)',
            color: '#FFFFFF',
            lineHeight: 1.15,
            fontFamily: SERIF_HEAD,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            margin: 0,
          }}
        >
          Your trusted partner
          <br />
          in better health
        </h2>
        <div className="flex items-center gap-3 mt-5">
          <div
            style={{
              width: '72px',
              height: '2px',
              background:
                'linear-gradient(90deg, rgba(134,239,172,0.15) 0%, rgba(134,239,172,0.9) 100%)',
              borderRadius: '2px',
            }}
          />
          <LeafSmallIcon style={{ width: '22px', height: '22px', color: '#86EFAC' }} />
        </div>
      </div>

      <div
        className="flex flex-col"
        style={{
          gap: '18px',
          maxWidth: '460px',
          width: '100%',
        }}
      >
        {[
          {
            icon: (
              <PillIcon style={{ width: '26px', height: '26px', color: '#BBF7D0', strokeWidth: 1.8 }} />
            ),
            title: 'Order Medicines',
            desc: 'Quick and easy access to medicines from trusted pharmacies.',
          },
          {
            icon: (
              <TruckIcon style={{ width: '26px', height: '26px', color: '#BBF7D0', strokeWidth: 1.8 }} />
            ),
            title: 'Fast Delivery',
            desc: 'Get your medicines delivered safely to your doorstep.',
          },
          {
            icon: (
              <ShieldCheckIcon
                style={{ width: '26px', height: '26px', color: '#BBF7D0', strokeWidth: 1.8 }}
              />
            ),
            title: 'Secure & Reliable',
            desc: 'Your health data is protected and safe with us.',
          },
        ].map((f, i) => (
          <div key={i} className="flex items-start" style={{ gap: '18px' }}>
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-full"
              style={{
                width: '58px',
                height: '58px',
                background:
                  'radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.45) 0%, rgba(0, 77, 51, 0.6) 100%)',
                border: '1.2px solid rgba(187, 247, 208, 0.45)',
                boxShadow: '0 8px 22px -14px rgba(0,0,0,0.5)',
              }}
            >
              {f.icon}
            </div>
            <div className="flex-1 min-w-0 pt-[6px]">
              <h3
                style={{
                  fontSize: '17px',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontFamily: SERIF_HEAD,
                  letterSpacing: '-0.005em',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.78)',
                  lineHeight: 1.55,
                  fontWeight: 500,
                  marginTop: '4px',
                  margin: 0,
                }}
              >
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
)

/* =========================================================================
   Layout shell
   ========================================================================= */
export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div
      className="auth-outer-shell relative w-full overflow-hidden flex items-center justify-center bg-slate-50/50"
      style={{
        boxSizing: 'border-box' as const,
        height: '100vh',
        minHeight: '100vh',
        maxHeight: '100vh',
        fontFamily: SANS_BODY,
      }}
    >
      {/* Mesh grid pattern background */}
      <div
        className="absolute inset-0 bg-grid-mesh pointer-events-none opacity-75"
        aria-hidden="true"
      />
      {/* Glow ambient background circles */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[35rem] h-[35rem] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      {/* 60% Inner Container */}
      <div
        className="auth-inner-container relative z-10 flex overflow-hidden backdrop-blur-md bg-white/80 border border-white/60 shadow-2xl rounded-3xl"
        style={{
          height: '85vh',
          minHeight: '600px',
          boxSizing: 'border-box' as const,
        }}
      >
        {/* FULL WIDTH CURVED BACKGROUND SVG */}
        <div className="hidden md:block absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          <svg
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            <defs>
              <linearGradient id="seamCurveStrokeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#BBF7D0" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#86EFAC" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#4ADE80" stopOpacity="0.95" />
              </linearGradient>
              <filter id="seamCurveSoftShadow" x="-20%" y="-5%" width="140%" height="110%">
                <feDropShadow dx="1.5" dy="0" stdDeviation="1.5" floodColor={BRAND_DARK} floodOpacity="0.26" />
              </filter>
            </defs>

            {/* Green fill for the right half */}
            <path
              d="M 500 0 C 532 125, 532 375, 500 500 S 468 875, 500 1000 L 1000 1000 L 1000 0 Z"
              fill={BRAND}
            />

            {/* Soft luminous outer glow */}
            <path
              d="M 500 0 C 532 125, 532 375, 500 500 S 468 875, 500 1000"
              fill="none"
              stroke="#DCFCE7"
              strokeWidth="7"
              strokeLinecap="round"
              opacity="0.22"
            />
            {/* Crisp mint highlight along the curve */}
            <path
              d="M 500 0 C 532 125, 532 375, 500 500 S 468 875, 500 1000"
              fill="none"
              stroke="url(#seamCurveStrokeGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="url(#seamCurveSoftShadow)"
            />
          </svg>
        </div>
        {/* ---------------- LEFT — White Form ---------------- */}
        <div
          className="auth-left-panel relative overflow-hidden flex items-center justify-center"
          style={{
            width: '50%',
            height: '100%',
            background: 'transparent',
            boxSizing: 'border-box' as const,
            zIndex: 10,
          }}
        >
          <div
            className="auth-left-content relative z-10 w-full overflow-y-auto"
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '24px 52px 24px 48px',
              boxSizing: 'border-box' as const,
              maxHeight: '100%',
            }}
          >
            {/* Logo — uses real /logo1.png */}
            <div className="mb-7 mt-4 flex justify-center w-full">
              <img
                src="/logo1.png"
                alt="E-Pharmacy Logo"
                className="object-contain"
                style={{ width: '80px', height: '80px' }}
              />
            </div>

            {title ? (
              <div className="mb-6">
                <h2
                  style={{
                    fontSize: '26px',
                    color: '#111827',
                    fontFamily: SERIF_HEAD,
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {title}
                </h2>
                {subtitle && (
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#6B7280',
                      marginTop: '6px',
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            ) : null}

            <div className="pb-8">{children}</div>
          </div>
        </div>

        {/* ---------------- RIGHT — Green Promo ---------------- */}
        <div
          className="hidden md:block relative overflow-hidden"
          style={{
            width: '50%',
            height: '100%',
            background: 'transparent',
            boxSizing: 'border-box' as const,
            display: 'block',
            zIndex: 10,
          }}
        >
          <RightPanelContent />
        </div>

        {/* (Curved seam overlay removed for clean color matching) */}

      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; }

        html,
        body,
        #root {
          height: 100vh !important;
          min-height: 100vh !important;
          max-height: 100vh !important;
          width: 100vw !important;
          max-width: 100vw !important;
          overflow: hidden !important;
          margin: 0;
          padding: 0;
          font-family: ${SANS_BODY};
        }

        .auth-left-content,
        .auth-left-panel {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
          scroll-behavior: smooth;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }
        .auth-left-content::-webkit-scrollbar,
        .auth-left-panel::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .auth-left-content::-webkit-scrollbar-track,
        .auth-left-panel::-webkit-scrollbar-track { background: transparent !important; }
        .auth-left-content::-webkit-scrollbar-thumb,
        .auth-left-panel::-webkit-scrollbar-thumb { background: transparent !important; }

        .auth-inner-container {
          width: 60%;
        }

        @media (max-width: 767px) {
          .auth-outer-shell { background: #FFFFFF !important; }
          .auth-inner-container {
            width: 100% !important;
            height: 100vh !important;
            min-height: 100vh !important;
            border-radius: 0 !important;
            border: none !important;
          }
          .auth-left-panel {
            width: 100% !important;
            height: 100vh !important;
            min-height: 100vh !important;
            max-height: 100vh !important;
            overflow-y: auto !important;
          }
          .auth-left-content {
            padding: 22px 20px !important;
            max-width: 100% !important;
            max-height: 100vh !important;
            overflow-y: auto !important;
          }
        }
      `}</style>
    </div>
  )
}
