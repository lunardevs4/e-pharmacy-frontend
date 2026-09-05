import React from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import { useLanguageStore } from '@/store/languageStore'
import {
  User,
  PlusSquare,
  Shield,
  ArrowRight,
} from 'lucide-react'

const BRAND = '#059669'
const BRAND_HOVER = '#047857'

export default function RegisterSelector() {
  const { t } = useLanguageStore()

  const options = [
    {
      title: t('role.patient'),
      subtitle: t('role.patient.sub'),
      link: '/register/patient',
      icon: User,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-health-primary',
      accentColor: BRAND,
    },
    {
      title: t('role.pharmacy'),
      subtitle: t('role.pharmacy.sub'),
      link: '/register/pharmacy',
      icon: PlusSquare,
      bgColor: 'bg-teal-50',
      iconColor: 'text-emerald-700',
      accentColor: '#0f766e',
    },
    {
      title: t('role.insurance'),
      subtitle: t('role.insurance.sub'),
      link: '/register/insurance',
      icon: Shield,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-health-primary',
      accentColor: '#064e3b',
    },
  ]

  return (
    <AuthLayout
      mode="register"
      title={t('auth.createAccount')}
      subtitle={t('auth.selectRole')}
    >
      <div className="flex flex-col gap-4 font-sans xl:flex-row xl:flex-wrap">
        {options.map((opt, idx) => {
          const Icon = opt.icon
          return (
            <Link
              key={idx}
              to={opt.link}
              className={`group p-5 bg-white rounded-lg border border-gray-200 hover:border-[#059669] hover:shadow-md transition-all duration-200 flex items-start gap-4 text-left relative overflow-hidden auth-card xl:flex-shrink-0 xl:flex-col ${
                idx < 2 ? 'xl:basis-[calc(50%-0.5rem)]' : 'xl:basis-full'
              }`}
              style={{
                borderColor: '#E5E7EB',
                borderWidth: '1px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = BRAND
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB'
              }}
            >
              <div
                className={`w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${opt.bgColor} ${opt.iconColor} group-hover:bg-[#059669] group-hover:text-white`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-grow">
                <span className="block text-[11px] font-black uppercase tracking-wider text-gray-400 group-hover:text-[#059669] transition-colors">
                  {opt.subtitle}
                </span>
                <h4 className="text-base font-bold text-gray-900 mt-0.5 group-hover:text-[#059669] transition-colors">
                  {opt.title}
                </h4>
                <div className="text-[11px] font-bold text-[#059669] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 mt-3">
                  <span>{t('role.onboard')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          )
        })}

        <div className="mt-4 pt-4 border-t border-gray-150 flex w-full flex-col justify-center items-center text-xs text-center font-sans font-semibold xl:basis-full">
          <span style={{ color: '#6B7280', fontWeight: 500 }}>{t('auth.alreadyOnboarded')} </span>
          <Link
            to="/login"
            className="mt-1"
            style={{ color: BRAND, fontWeight: 700 }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            {t('auth.signIn')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
