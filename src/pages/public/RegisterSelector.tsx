import React from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import {
  User,
  PlusSquare,
  Shield,
  ArrowRight,
} from 'lucide-react'

const BRAND = '#006846'
const BRAND_HOVER = '#005238'

export default function RegisterSelector() {
  const options = [
    {
      title: 'Register as Patient',
      subtitle: 'Citizen Portal Setup',
      desc: 'Search medicines, check local pharmacy stocks, and reserve items using your National ID.',
      link: '/register/patient',
      icon: User,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-health-primary',
      accentColor: BRAND,
    },
    {
      title: 'Register as Pharmacy',
      subtitle: 'Store Onboarding Setup',
      desc: 'Onboard a licensed pharmacy store owner account to manage inventories, staff, and verify prescriptions.',
      link: '/register/pharmacy',
      icon: PlusSquare,
      bgColor: 'bg-teal-50',
      iconColor: 'text-emerald-700',
      accentColor: '#0f766e',
    },
    {
      title: 'Register as Insurance',
      subtitle: 'Insurance Portal Setup',
      desc: 'Register a digital insurance portal account to process claims, verify policies, and view co-pay reports.',
      link: '/register/insurance',
      icon: Shield,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-700',
      accentColor: '#1d4ed8',
    },
  ]

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Select your role below to access the national medicine inventory, search, and reservation systems."
    >
      <div className="flex flex-col gap-4 font-sans">
        {options.map((opt, idx) => {
          const Icon = opt.icon
          return (
            <Link
              key={idx}
              to={opt.link}
              className="group p-5 bg-white rounded-2xl border border-gray-200 hover:border-health-primary hover:shadow-lg transition-all duration-200 flex items-start gap-4 text-left relative overflow-hidden"
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
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${opt.bgColor} ${opt.iconColor} group-hover:bg-health-primary group-hover:text-white`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-grow">
                <span className="block text-[11px] font-black uppercase tracking-wider text-gray-400 group-hover:text-health-primary transition-colors">
                  {opt.subtitle}
                </span>
                <h4 className="text-base font-bold text-gray-900 mt-0.5 group-hover:text-health-primary transition-colors">
                  {opt.title}
                </h4>
                <p className="text-gray-500 text-xs mt-1.5 leading-relaxed font-medium">
                  {opt.desc}
                </p>
                <div className="text-[11px] font-bold text-health-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 mt-3">
                  <span>Onboard Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          )
        })}

        <div className="mt-4 pt-4 border-t border-gray-150 flex flex-col justify-center items-center text-xs text-center font-sans font-semibold">
          <span style={{ color: '#6B7280', fontWeight: 500 }}>Already onboarded? </span>
          <Link
            to="/login"
            className="mt-1"
            style={{ color: BRAND, fontWeight: 700 }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            Sign In to your account
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
